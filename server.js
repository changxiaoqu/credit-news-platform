const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data/news.db');

// 中间件
app.use(express.json());
app.use(express.static('templates'));

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
        // 确保数据目录存在
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) reject(err);
            else {
                // 创建表
                const schema = fs.readFileSync(path.join(__dirname, 'data/schema.sql'), 'utf8');
                db.exec(schema, (err) => {
                    if (err) reject(err);
                    else resolve(db);
                });
            }
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
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
    }

    if (search) {
        sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY publish_date DESC, crawl_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const db = getDB();
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
});

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

// 启动服务器
async function start() {
    try {
        await initDB();
        console.log('Database initialized');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();