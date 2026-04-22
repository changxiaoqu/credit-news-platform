const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway Volume 支持：使用环境变量配置数据库路径
// 本地开发使用 ./data/news.db，Railway 使用 /data/news.db (Volume 挂载点)
const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 中间件
app.use(express.json());
app.use(express.static('templates'));

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
        // 确保数据目录存在
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }

        // 检查数据库文件是否已存在（从Git部署的）
        const dbExists = fs.existsSync(DB_PATH);
        
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) reject(err);
            else {
                if (dbExists) {
                    // 数据库文件已存在，确保 FTS5 表存在
                    db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(title, summary, content)`, (err) => {
                        if (err) reject(err);
                        else {
                            console.log('Using existing database with FTS5:', DB_PATH);
                            resolve(db);
                        }
                    });
                } else {
                    // 创建新表
                    const schema = `
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    source TEXT,
    url TEXT UNIQUE,
    category TEXT,
    tags TEXT,
    publish_date DATE,
    crawl_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    is_important INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_publish_date ON articles(publish_date);
CREATE INDEX IF NOT EXISTS idx_crawl_date ON articles(crawl_date);

-- FTS5 全文检索表（★新增）
-- 本地表模式，存储 title/summary/content 副本，INSERT OR REPLACE 同步更新
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    title,
    summary,
    content
);
                    `;
                    db.exec(schema, (err) => {
                        if (err) reject(err);
                        else resolve(db);
                    });
                }
            }
        });
    });
}

// 同步文章到 FTS5（★新增）
function syncToFTS(db, id, title, summary, content) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO articles_fts(rowid, title, summary, content) VALUES (?, ?, ?, ?)`,
            [id, title || '', summary || '', content || ''], (err) => {
                if (err) reject(err);
                else resolve();
            });
    });
}

// 重建 FTS5 索引（用于初始化时批量同步）
// 策略：DROP + CREATE + INSERT，避免 DELETE 触发虚拟表内部问题
function rebuildFTS(db) {
    return new Promise((resolve, reject) => {
        db.exec(`
            DROP TABLE IF EXISTS articles_fts;
            CREATE VIRTUAL TABLE articles_fts USING fts5(title, summary, content);
            INSERT INTO articles_fts(rowid, title, summary, content)
                SELECT id, COALESCE(title,''), COALESCE(summary,''), COALESCE(content,'') FROM articles;
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// 获取数据库连接
function getDB() {
    return new sqlite3.Database(DB_PATH);
}

// API: 获取文章列表
app.get('/api/articles', (req, res) => {
    const { category, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const db = getDB();

    // ★ FTS5 全文检索 + 高亮
    if (search && search.trim()) {
        // 转义 FTS5 特殊字符（只保留基础安全转义）
        const safeQuery = search.trim().replace(/['"*()]/g, ' ').trim();
        if (!safeQuery) {
            return res.json([]);
        }
        // ★ FTS5 无 ICU 中文分词支持：中文按字符、英文按词分别前缀匹配
        // "信用卡" → "信*" OR "用*" OR "卡*"
        // "AI数字" → "AI"* OR "数*" OR "字*"
        const allChars = safeQuery.replace(/\s/g, '').split('');
        // 对每个字符/词生成前缀匹配条件
        const conditions = allChars.map(c => `"${c}"*`);
        const ftsQuery = conditions.join(' OR ');

        const sql = `
            SELECT a.*,
                snippet(articles_fts, 1, '<mark>', '</mark>', '…', 32) AS highlight_summary,
                snippet(articles_fts, 0, '<mark>', '</mark>', '…', 40) AS highlight_title
            FROM articles a
            INNER JOIN articles_fts fts ON a.id = fts.rowid
            WHERE articles_fts MATCH ?
            ${category && category !== 'all' ? ' AND a.category = ?' : ''}
            ORDER BY rank
            LIMIT ? OFFSET ?
        `;
        const params = category && category !== 'all'
            ? [ftsQuery, category, parseInt(limit), offset]
            : [ftsQuery, parseInt(limit), offset];

        db.all(sql, params, (err, rows) => {
            db.close();
            if (err) {
                console.error('FTS search error:', err.message);
                // FTS 失败时降级到 LIKE
                fallbackSearch(db, category, search, parseInt(limit), offset, res);
            } else {
                res.json(rows.map(row => ({
                    ...row,
                    tags: JSON.parse(row.tags || '[]'),
                    // 有高亮就用高亮，没有就用原字段
                    _title: row.highlight_title || row.title,
                    _summary: row.highlight_summary || row.summary
                })));
            }
        });
    } else {
        // 无搜索时走普通查询
        let sql = 'SELECT * FROM articles WHERE 1=1';
        const params = [];
        if (category && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category);
        }
        sql += ' ORDER BY publish_date DESC, crawl_date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        db.all(sql, params, (err, rows) => {
            db.close();
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows.map(row => ({
                    ...row,
                    tags: JSON.parse(row.tags || '[]')
                })));
            }
        });
    }
});

// LIKE 降级搜索（当 FTS 不可用时）
function fallbackSearch(db, category, search, limit, offset, res) {
    const sql = `
        SELECT * FROM articles
        WHERE (title LIKE ? OR summary LIKE ? OR content LIKE ?)
        ${category && category !== 'all' ? ' AND category = ?' : ''}
        ORDER BY publish_date DESC
        LIMIT ? OFFSET ?
    `;
    const p = [`%${search}%`, `%${search}%`, `%${search}%`];
    if (category && category !== 'all') p.push(category);
    p.push(limit, offset);
    db.all(sql, p, (err, rows) => {
        db.close();
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(rows.map(row => ({
            ...row,
            tags: JSON.parse(row.tags || '[]')
        })));
    });
}

// API: 获取单篇文章
app.get('/api/articles/:id', (req, res) => {
    const db = getDB();
    db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Not found' });
        } else {
            res.json({
                ...row,
                tags: JSON.parse(row.tags || '[]')
            });
        }
    });
});

// API: 获取统计信息
app.get('/api/stats', (req, res) => {
    const db = getDB();
    const stats = {};

    db.get('SELECT COUNT(*) as total FROM articles', [], (err, row) => {
        if (err) {
            db.close();
            res.status(500).json({ error: err.message });
            return;
        }
        stats.total = row.total;

        db.all('SELECT category, COUNT(*) as count FROM articles GROUP BY category', [], (err, rows) => {
            if (err) {
                db.close();
                res.status(500).json({ error: err.message });
                return;
            }
            stats.byCategory = rows;

            const today = new Date().toISOString().split('T')[0];
            db.get('SELECT COUNT(*) as count FROM articles WHERE DATE(crawl_date) = ?', [today], (err, row) => {
                db.close();
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                stats.today = row.count;
                res.json(stats);
            });
        });
    });
});

// API: 标记已读
app.post('/api/articles/:id/read', (req, res) => {
    const db = getDB();
    db.run('UPDATE articles SET is_read = 1 WHERE id = ?', [req.params.id], function(err) {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, changes: this.changes });
        }
    });
});

// API: 标记重要
app.post('/api/articles/:id/important', (req, res) => {
    const db = getDB();
    db.run('UPDATE articles SET is_important = 1 WHERE id = ?', [req.params.id], function(err) {
        db.close();
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, changes: this.changes });
        }
    });
});

// API: 批量导入文章（需要密钥）
app.post('/api/articles/bulk-import', (req, res) => {
    const { secret, articles } = req.body;
    
    if (secret !== process.env.CRAWLER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ error: 'Invalid articles data' });
    }
    
    const db = getDB();
    const sql = `
        INSERT OR IGNORE INTO articles (title, summary, content, source, url, category, tags, publish_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    let added = 0;
    let skipped = 0;
    let failed = 0;
    const newIds = []; // 记录新插入的 id，用于同步 FTS
    
    db.serialize(() => {
        const stmt = db.prepare(sql);
        
        for (const article of articles) {
            stmt.run([
                article.title,
                article.summary || '',
                article.content || '',
                article.source || '未知来源',
                article.url,
                article.category || 'bid',
                JSON.stringify(article.tags || ['投标']),
                article.publish_date || new Date().toISOString().split('T')[0]
            ], function(err) {
                if (err) {
                    failed++;
                } else if (this.changes > 0) {
                    added++;
                    newIds.push(this.lastID);
                } else {
                    skipped++;
                }
            });
        }
        
        stmt.finalize((err) => {
            if (err) {
                db.close();
                return res.status(500).json({ error: err.message });
            }
            
            // ★ 同步新数据到 FTS5
            if (newIds.length > 0) {
                db.get(`SELECT id, title, summary, content FROM articles WHERE id IN (${newIds.map(() => '?').join(',')})`,
                    newIds, (err, rows) => {
                        // 逐条同步（简单处理，异步不阻塞响应）
                        newIds.forEach(id => {
                            db.get('SELECT id, title, summary, content FROM articles WHERE id = ?', [id], (err, row) => {
                                if (!err && row) {
                                    syncToFTS(db, row.id, row.title, row.summary, row.content);
                                }
                            });
                        });
                        db.close();
                        res.json({ success: true, added, skipped, failed, total: articles.length });
                    });
            } else {
                db.close();
                res.json({ success: true, added, skipped, failed, total: articles.length });
            }
        });
    });
});

// API: 单条添加文章（需要密钥）
app.post('/api/articles', (req, res) => {
    const { secret, title, summary, content, source, url, category, tags, publish_date } = req.body;
    
    if (secret !== process.env.CRAWLER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!title || !url) {
        return res.status(400).json({ error: 'Title and URL are required' });
    }
    
    const db = getDB();
    const sql = `
        INSERT OR IGNORE INTO articles (title, summary, content, source, url, category, tags, publish_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
        title,
        summary || '',
        content || '',
        source || '未知来源',
        url,
        category || 'bid',
        JSON.stringify(tags || ['投标']),
        publish_date || new Date().toISOString().split('T')[0]
    ], function(err) {
        if (err) {
            db.close();
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            db.close();
            return res.status(409).json({ error: 'Article already exists' });
        }
        // ★ 同步到 FTS5
        syncToFTS(db, this.lastID, title, summary || '', content || '').then(() => {
            db.close();
            res.status(201).json({ success: true, id: this.lastID, message: 'Article added successfully' });
        }).catch(() => {
            db.close();
            res.status(201).json({ success: true, id: this.lastID, message: 'Article added (FTS sync pending)' });
        });
    });
});
app.post('/api/trigger-crawler', (req, res) => {
    const { secret } = req.body;
    if (secret !== process.env.CRAWLER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 执行爬虫脚本
    const { exec } = require('child_process');
    const crawlerPath = path.join(__dirname, 'scripts', 'crawler.js');
    
    exec(`node "${crawlerPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Crawler error:', error);
            return res.status(500).json({ error: 'Crawler failed', details: error.message });
        }
        console.log('Crawler output:', stdout);
        if (stderr) console.error('Crawler stderr:', stderr);
        res.json({ success: true, message: 'Crawler triggered successfully' });
    });
});

// 启动服务器
async function start() {
    try {
        await initDB();
        console.log('Database initialized at:', DB_PATH);

        // 检查是否需要初始化数据（Railway每次部署都重新初始化）
        const db = getDB();
        db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
            // Railway部署时强制重新初始化数据（因为没有持久化存储）
            console.log('Initializing data on every deploy, articles count:', row.count);
            const { initData } = require('./scripts/init-data');
            initData().then(() => {
                // ★ 启动后重建 FTS 索引
                return rebuildFTS(db);
            }).then(() => {
                console.log('✅ FTS5 index rebuilt');
                db.close();
            }).catch(err => {
                db.close();
                console.error('Failed to load initial data:', err);
            });
        });

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();