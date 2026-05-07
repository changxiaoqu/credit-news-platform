const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'news.db');

app.use(cors());
app.use(express.json());
app.use(express.static('templates'));

// 首页
app.get('/', (req, res) => res.sendFile('index.html', { root: 'templates' }));

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) reject(err);
            else {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS articles (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        summary TEXT,
                        full_content TEXT,
                        source TEXT,
                        source_url TEXT,
                        publish_date DATE,
                        crawl_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                        category TEXT,
                        related_banks TEXT,
                        is_duplicate INTEGER DEFAULT 0,
                        duplicate_sources TEXT,
                        
                        -- 处罚专用
                        penalty_amount REAL,
                        penalized_institution TEXT,
                        institution_level TEXT,
                        parent_bank TEXT,
                        bank_type TEXT,
                        penalty_authority TEXT,
                        penalty_date DATE,
                        penalty_reason TEXT,
                        penalty_reason_summary TEXT,
                        penalty_document_no TEXT,
                        other_punishments TEXT,
                        
                        -- 投标/商机专用
                        project_name TEXT,
                        procuring_entity TEXT,
                        procuring_level TEXT,
                        budget TEXT,
                        bid_deadline DATE,
                        bid_status TEXT,
                        winner TEXT,
                        winner_amount TEXT,
                        core_requirements TEXT,
                        
                        -- 政策专用
                        policy_no TEXT,
                        issuing_authority TEXT,
                        effective_date DATE,
                        policy_level TEXT,
                        key_points TEXT,
                        is_key_policy INTEGER DEFAULT 0
                    );
                    CREATE INDEX IF NOT EXISTS idx_category ON articles(category);
                    CREATE INDEX IF NOT EXISTS idx_publish_date ON articles(publish_date);
                    
                    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(title, summary, full_content);
                `, (err) => {
                    if (err) reject(err);
                    else resolve(db);
                });
            }
        });
    });
}

// API: 获取文章列表
app.get('/api/articles', (req, res) => {
    const { category, page = 1, limit = 20, search, days, start, end } = req.query;
    const offset = (page - 1) * parseInt(limit);
    const db = new sqlite3.Database(DB_PATH);
    
    let sql = 'SELECT * FROM articles WHERE 1=1';
    const params = [];
    
    if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
    }
    
    // 时间筛选
    if (days) {
        const date = new Date();
        date.setDate(date.getDate() - parseInt(days));
        sql += ' AND publish_date >= ?';
        params.push(date.toISOString().split('T')[0]);
    }
    if (start) {
        sql += ' AND publish_date >= ?';
        params.push(start);
    }
    if (end) {
        sql += ' AND publish_date <= ?';
        params.push(end);
    }
    
    if (search) {
        sql += ' AND (title LIKE ? OR summary LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY publish_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(sql, params, (err, rows) => {
        db.close();
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })));
    });
});

// API: 获取单篇
app.get('/api/articles/:id', (req, res) => {
    const db = new sqlite3.Database(DB_PATH);
    db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
        db.close();
        if (err) res.status(500).json({ error: err.message });
        else res.json(row || {});
    });
});

// API: 统计
app.get('/api/stats', (req, res) => {
    const db = new sqlite3.Database(DB_PATH);
    db.get('SELECT COUNT(*) as total FROM articles', [], (err, row) => {
        if (err) { db.close(); res.status(500).json({ error: err.message }); return; }
        const total = row.total;
        
        db.all('SELECT category, COUNT(*) as count FROM articles GROUP BY category', [], (err, rows) => {
            db.close();
            if (err) res.status(500).json({ error: err.message });
            else res.json({ total, byCategory: rows });
        });
    });
});

// 启动
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
});