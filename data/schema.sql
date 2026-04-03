-- 资讯数据库表结构
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    source TEXT,
    url TEXT UNIQUE,
    category TEXT, -- policy(政策), risk(风险), bid(招标), news(资讯)
    tags TEXT, -- JSON array
    publish_date DATE,
    crawl_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    is_important INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_publish_date ON articles(publish_date);
CREATE INDEX IF NOT EXISTS idx_crawl_date ON articles(crawl_date);

-- 搜索索引
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    title, content, content='articles', content_rowid='id'
);