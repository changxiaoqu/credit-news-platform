#!/usr/bin/env node
/**
 * 数据同步脚本 - 将本地数据库数据导入到 Railway
 * 使用方法: 
 *   1. 设置环境变量: export RAILWAY_SECRET=你的密钥
 *   2. 运行: node sync-to-railway.js [railway-url]
 * 
 * 注意: 需要先设置 CRALWER_SECRET 环境变量
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const LOCAL_DB_PATH = path.join(__dirname, '../data/news.db');
const RAILWAY_API_URL = process.argv[2] || 'https://credit-news-platform-production.up.railway.app/api';
const SECRET = process.env.CRAWLER_SECRET || 'your-secret-key';

// 从本地数据库读取所有文章
function getLocalArticles() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(LOCAL_DB_PATH, (err) => {
            if (err) {
                reject(new Error(`无法打开本地数据库: ${err.message}`));
                return;
            }
        });

        db.all('SELECT * FROM articles ORDER BY id', [], (err, rows) => {
            db.close();
            if (err) {
                reject(new Error(`查询失败: ${err.message}`));
                return;
            }
            resolve(rows);
        });
    });
}

// 批量导入到 Railway
async function bulkImportToRailway(articles) {
    const url = `${RAILWAY_API_URL}/articles/bulk-import`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            secret: SECRET,
            articles: articles.map(a => ({
                title: a.title,
                summary: a.summary,
                content: a.content,
                source: a.source,
                url: a.url,
                category: a.category,
                tags: JSON.parse(a.tags || '[]'),
                publish_date: a.publish_date
            }))
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`导入失败: ${error}`);
    }
    
    return await response.json();
}

// 获取 Railway 统计信息
async function getRailwayStats() {
    try {
        const response = await fetch(`${RAILWAY_API_URL}/stats`);
        return await response.json();
    } catch (err) {
        return { total: 0 };
    }
}

// 主函数
async function main() {
    console.log('='.repeat(60));
    console.log('🚀 数据同步工具 - 本地 → Railway');
    console.log('='.repeat(60));
    console.log(`Railway API: ${RAILWAY_API_URL}`);
    console.log('');

    if (SECRET === 'your-secret-key') {
        console.log('⚠️ 警告: 未设置 CRALWER_SECRET 环境变量');
        console.log('   请运行: export CRALWER_SECRET=你的密钥');
        console.log('');
    }

    try {
        // 读取本地数据
        console.log('📖 读取本地数据库...');
        const articles = await getLocalArticles();
        console.log(`   本地共有 ${articles.length} 条数据`);
        console.log('');

        // 获取 Railway 当前数据
        console.log('📡 获取 Railway 当前数据...');
        const railwayStats = await getRailwayStats();
        console.log(`   Railway 当前有 ${railwayStats.total} 条数据`);
        console.log('');

        // 如果本地数据比 Railway 多，说明需要同步
        if (articles.length <= railwayStats.total) {
            console.log('✅ Railway 数据已是最新，无需同步');
            return;
        }

        const newArticles = articles.slice(railwayStats.total);
        console.log(`📤 开始同步 ${newArticles.length} 条新数据...`);
        console.log('');

        // 批量导入（每批 10 条）
        const batchSize = 10;
        let totalAdded = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (let i = 0; i < newArticles.length; i += batchSize) {
            const batch = newArticles.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(newArticles.length / batchSize);
            
            console.log(`[${batchNum}/${totalBatches}] 导入 ${batch.length} 条数据...`);
            
            try {
                const result = await bulkImportToRailway(batch);
                totalAdded += result.added;
                totalSkipped += result.skipped;
                totalFailed += result.failed;
                
                console.log(`   ✅ 新增: ${result.added}, ⏭️ 跳过: ${result.skipped}, ❌ 失败: ${result.failed}`);
            } catch (err) {
                console.error(`   ❌ 批次失败: ${err.message}`);
                totalFailed += batch.length;
            }
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('');
        console.log('='.repeat(60));
        console.log('📊 同步完成');
        console.log('='.repeat(60));
        console.log(`   新增: ${totalAdded} 条`);
        console.log(`   跳过: ${totalSkipped} 条`);
        console.log(`   失败: ${totalFailed} 条`);
        console.log('');
        
        // 再次获取统计
        const finalStats = await getRailwayStats();
        console.log(`🎉 Railway 现在有 ${finalStats.total} 条数据`);

    } catch (err) {
        console.error('❌ 同步失败:', err.message);
        process.exit(1);
    }
}

// 运行主函数
main();
