#!/usr/bin/env node
/**
 * 城商行和农商行信用卡及外围系统投标信息爬虫
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { getAllSearchQueries, getTagsForQuery } = require('./search-config');

const DB_PATH = path.join(__dirname, '../data/news.db');

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) reject(err);
            else resolve(db);
        });
    });
}

// 检查文章是否已存在
async function articleExists(db, url) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM articles WHERE url = ?', [url], (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
        });
    });
}

// 保存文章
async function saveArticle(db, article) {
    const exists = await articleExists(db, article.url);
    if (exists) {
        console.log(`  [跳过] ${article.title.substring(0, 40)}...`);
        return false;
    }

    const sql = `
        INSERT INTO articles (title, summary, source, url, category, tags, publish_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [
            article.title,
            article.summary,
            article.source,
            article.url,
            article.category,
            JSON.stringify(article.tags),
            article.publish_date
        ], function(err) {
            if (err) {
                console.error(`  [错误] ${err.message}`);
                resolve(false);
            } else {
                console.log(`  [新增] ${article.title.substring(0, 40)}...`);
                resolve(true);
            }
        });
    });
}

// 处理搜索结果
async function processSearchResults(db, query, results) {
    console.log(`\n🔍 ${query}`);
    
    let added = 0;
    let skipped = 0;
    const tags = getTagsForQuery(query);
    
    for (const item of results) {
        const article = {
            title: item.title || '无标题',
            summary: item.snippet || item.summary || '',
            source: item.source || '未知来源',
            url: item.url,
            category: 'bid',
            tags: tags,
            publish_date: item.date || new Date().toISOString().split('T')[0]
        };
        
        const saved = await saveArticle(db, article);
        if (saved) {
            added++;
        } else {
            skipped++;
        }
    }
    
    console.log(`   新增: ${added}, 跳过: ${skipped}`);
    return { added, skipped };
}

// 运行爬虫
async function runCrawler(searchResults) {
    console.log('='.repeat(60));
    console.log('🏦 城商行和农商行信用卡及外围系统投标信息爬虫');
    console.log('='.repeat(60));
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    console.log('');
    
    let db;
    let totalAdded = 0;
    let totalSkipped = 0;
    
    try {
        db = await initDB();
        
        // 确保表存在
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
        `;
        await new Promise((resolve, reject) => {
            db.exec(schema, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // 处理搜索结果
        if (searchResults && Object.keys(searchResults).length > 0) {
            for (const [query, results] of Object.entries(searchResults)) {
                if (Array.isArray(results) && results.length > 0) {
                    const { added, skipped } = await processSearchResults(db, query, results);
                    totalAdded += added;
                    totalSkipped += skipped;
                }
            }
        } else {
            console.log('⚠️ 未提供搜索结果');
            console.log('请使用以下关键词通过 kimi_search 搜索:');
            const queries = getAllSearchQueries();
            queries.forEach((q, i) => {
                console.log(`  ${i + 1}. ${q}`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
        console.log(`📊 总计: 新增 ${totalAdded} 条, 跳过 ${totalSkipped} 条`);
        console.log('='.repeat(60));
        
    } catch (err) {
        console.error('❌ 爬虫运行失败:', err);
        throw err;
    } finally {
        if (db) db.close();
    }
    
    return { totalAdded, totalSkipped };
}

// 主函数
async function main() {
    console.log('城商行和农商行信用卡及外围系统投标信息爬虫');
    console.log('');
    console.log('搜索关键词列表:');
    const queries = getAllSearchQueries();
    queries.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q}`);
    });
    console.log('');
    console.log('使用方法:');
    console.log('1. 使用 OpenClaw kimi_search 工具搜索以上关键词');
    console.log('2. 将结果整理为 {query: [results]} 格式');
    console.log('3. 调用 runCrawler(searchResults) 保存到数据库');
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { runCrawler, getAllSearchQueries };