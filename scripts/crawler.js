#!/usr/bin/env node
/**
 * 信用卡资讯抓取脚本 - 简化版
 * 使用模拟数据填充数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/news.db');

// 模拟数据
const MOCK_ARTICLES = [
    {
        title: '国家金融监督管理总局发布信用卡业务新规',
        summary: '为进一步规范信用卡业务发展，国家金融监督管理总局发布最新通知，要求银行加强信用卡风险管理，规范营销行为。',
        content: '国家金融监督管理总局近日发布《关于加强信用卡业务管理的通知》，从发卡管理、额度管理、催收管理等方面提出明确要求。新规强调银行应当建立健全信用卡业务风险管理制度，合理确定信用卡授信额度，不得向无还款能力的客户发卡。',
        source: '金融监管总局',
        url: 'https://www.cbirc.gov.cn/',
        category: 'policy',
        tags: ['监管政策', '信用卡新规'],
        publish_date: '2026-04-01'
    },
    {
        title: '央行：加强信用卡资金用途管理',
        summary: '中国人民银行发布通知，要求各银行加强信用卡资金用途监测，严禁信用卡资金流入股市、房市。',
        content: '中国人民银行发布《关于进一步加强信用卡业务管理的通知》，要求各银行加强信用卡交易监测，对可疑交易及时进行风险提示。严禁信用卡资金用于购房、投资股票等禁止性领域。',
        source: '中国人民银行',
        url: 'http://www.pbc.gov.cn/',
        category: 'policy',
        tags: ['央行', '资金用途'],
        publish_date: '2026-03-28'
    },
    {
        title: '多家银行因信用卡风控不力被罚',
        summary: '银保监会公布最新行政处罚信息，多家银行因信用卡业务风控不力、违规发卡等问题被处以罚款。',
        content: '银保监会公布2026年第一季度行政处罚信息，共有12家银行因信用卡业务违规被处罚，主要问题包括：违规发卡、风控措施不到位、催收行为不规范等。罚款金额合计超过5000万元。',
        source: '银保监会',
        url: 'https://www.cbirc.gov.cn/',
        category: 'risk',
        tags: ['处罚', '风控'],
        publish_date: '2026-03-25'
    },
    {
        title: '某大型银行信用卡中心系统升级项目招标',
        summary: '某国有大型银行发布信用卡中心核心系统升级项目招标公告，预算金额约2亿元。',
        content: '招标公告：某国有大型银行信用卡中心拟对核心系统进行升级改造，项目包含系统架构优化、风控模型升级、数据分析平台搭建等内容。投标截止日期为2026年4月30日。',
        source: '中国招标投标公共服务平台',
        url: 'http://www.cebpubservice.com/',
        category: 'bid',
        tags: ['招标', '系统升级'],
        publish_date: '2026-04-02'
    },
    {
        title: '2026年一季度信用卡行业分析报告',
        summary: '中国银行业协会发布2026年一季度信用卡行业发展报告，显示行业整体稳健发展。',
        content: '报告显示，截至2026年一季度末，全国信用卡发卡量达9.8亿张，环比增长2.1%。信用卡交易额达12.5万亿元，同比增长8.3%。不良率控制在1.2%左右，整体风险可控。',
        source: '中国银行业协会',
        url: 'http://www.china-cba.net/',
        category: 'news',
        tags: ['行业报告', '数据分析'],
        publish_date: '2026-04-01'
    },
    {
        title: '信用卡数字化转型加速推进',
        summary: '多家银行加快信用卡业务数字化转型，推出智能风控、智能客服等创新应用。',
        content: '随着金融科技发展，信用卡业务数字化转型加速。多家银行引入人工智能技术，在风控审批、客户服务、精准营销等环节实现智能化。预计未来三年，信用卡业务数字化率将超过90%。',
        source: '金融时报',
        url: 'http://www.financialnews.com.cn/',
        category: 'news',
        tags: ['数字化转型', '金融科技'],
        publish_date: '2026-03-30'
    },
    {
        title: '银行加强信用卡反欺诈能力建设',
        summary: '为应对日益复杂的欺诈手段，多家银行加大投入，建设智能反欺诈系统。',
        content: '面对电信网络诈骗、盗刷等风险，银行纷纷加强反欺诈能力建设。通过引入大数据、人工智能等技术，建立实时交易监控系统，有效识别和拦截可疑交易，保护持卡人资金安全。',
        source: '银行卡检测中心',
        url: 'http://www.bctest.com/',
        category: 'risk',
        tags: ['反欺诈', '风险控制'],
        publish_date: '2026-03-27'
    },
    {
        title: '某股份制银行信用卡风控系统采购中标公告',
        summary: '某股份制银行信用卡风控系统升级项目中标结果公布，某科技公司中标。',
        content: '中标公告：某股份制银行信用卡风控系统升级项目经评审，确定由某科技公司中标，中标金额3850万元。项目将建设新一代智能风控平台，提升风险识别和预警能力。',
        source: '中国采购与招标网',
        url: 'http://www.chinabidding.com.cn/',
        category: 'bid',
        tags: ['中标', '风控系统'],
        publish_date: '2026-03-26'
    }
];

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

// 主函数
async function main() {
    console.log('=== 信用卡资讯抓取任务 ===');
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    
    let db;
    try {
        db = await initDB();
        
        // 创建表（如果不存在）
        const schema = fs.readFileSync(path.join(__dirname, '../data/schema.sql'), 'utf8');
        await runSQL(db, schema);
        
        // 插入模拟数据
        let added = 0;
        for (const article of MOCK_ARTICLES) {
            const saved = await saveArticle(db, article);
            if (saved) added++;
        }
        
        console.log(`\n=== 任务完成 ===`);
        console.log(`新增文章: ${added} 条`);
        console.log(`跳过重复: ${MOCK_ARTICLES.length - added} 条`);
        
    } catch (err) {
        console.error('任务失败:', err);
        process.exit(1);
    } finally {
        if (db) db.close();
    }
}

main();
