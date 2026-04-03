#!/usr/bin/env node
/**
 * 信用卡资讯自动抓取脚本
 * 使用 kimi_search 搜索相关资讯并存储到 SQLite
 */

const { kimi_search } = require('../../../.openclaw/tools/kimi-search.cjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/news.db');

// 搜索配置
const SEARCH_CONFIG = [
    {
        category: 'policy',
        name: '监管政策',
        queries: [
            '国家金融监督管理总局 信用卡 通知 政策',
            '央行 信用卡 新规 监管',
            '银保监会 信用卡 合规 规定'
        ]
    },
    {
        category: 'risk',
        name: '风险新规',
        queries: [
            '信用卡 风险 新规 风控',
            '信用卡 反欺诈 风险预警',
            '信用卡 资金安全 监管'
        ]
    },
    {
        category: 'bid',
        name: '招标信息',
        queries: [
            '信用卡 系统 招标 采购',
            '银行 信用卡 项目 招标',
            '信用卡 风控系统 中标'
        ]
    },
    {
        category: 'news',
        name: '行业资讯',
        queries: [
            '信用卡 行业动态 市场',
            '信用卡 发卡量 报告',
            '信用卡 数字化转型'
        ]
    }
];

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) reject(err);
            else resolve(db);
        });
    });
}

// 执行SQL
function runSQL(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
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
        console.log(`[跳过] 已存在: ${article.title}`);
        return false;
    }

    const sql = `
        INSERT INTO articles (title, summary, content, source, url, category, tags, publish_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await runSQL(db, sql, [
        article.title,
        article.summary,
        article.content,
        article.source,
        article.url,
        article.category,
        JSON.stringify(article.tags),
        article.publish_date
    ]);
    
    console.log(`[新增] ${article.title}`);
    return true;
}

// 搜索并保存
async function searchAndSave(db, config) {
    console.log(`\n=== 搜索: ${config.name} ===`);
    
    for (const query of config.queries) {
        console.log(`\n查询: ${query}`);
        
        try {
            const results = await kimi_search({ query, limit: 5 });
            
            for (const result of results.results || []) {
                const article = {
                    title: result.title,
                    summary: result.snippet || result.title,
                    content: result.content || result.snippet,
                    source: result.source || '网络',
                    url: result.url,
                    category: config.category,
                    tags: [config.name],
                    publish_date: new Date().toISOString().split('T')[0]
                };
                
                await saveArticle(db, article);
            }
        } catch (err) {
            console.error(`搜索失败: ${query}`, err.message);
        }
        
        // 延迟避免请求过快
        await new Promise(r => setTimeout(r, 1000));
    }
}

// 主函数
async function main() {
    console.log('=== 信用卡资讯抓取任务 ===');
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    
    let db;
    try {
        db = await initDB();
        
        // 创建表（如果不存在）
        const fs = require('fs');
        const schema = fs.readFileSync(path.join(__dirname, '../data/schema.sql'), 'utf8');
        await runSQL(db, schema);
        
        // 执行搜索
        for (const config of SEARCH_CONFIG) {
            await searchAndSave(db, config);
        }
        
        console.log('\n=== 任务完成 ===');
        
    } catch (err) {
        console.error('任务失败:', err);
        process.exit(1);
    } finally {
        if (db) db.close();
    }
}

main();