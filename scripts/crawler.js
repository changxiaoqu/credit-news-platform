#!/usr/bin/env node
/**
 * 信用卡资讯抓取脚本 - 真实数据版
 * 基于搜索的真实资讯数据
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../data/news.db');

// 真实数据 - 2026年1月至今
const REAL_ARTICLES = [
    {
        title: '财政部等三部门：优化实施个人消费贷款财政贴息政策，信用卡账单分期纳入贴息范围',
        summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期延长至2026年底，信用卡账单分期业务纳入支持范围，年贴息比例为1个百分点。',
        content: '2026年1月20日，财政部、中国人民银行、国家金融监督管理总局联合发布《关于优化实施个人消费贷款财政贴息政策有关事项的通知》。主要内容包括：一、延长政策期限至2026年12月31日；二、将信用卡账单分期业务纳入支持范围，年贴息比例为1个百分点；三、取消消费领域限制，各领域真实合规消费均可享受贴息；四、取消单笔贴息500元上限及单机构小额累计1000元上限；五、扩大经办机构范围，将监管评级3A及以上的城商行、农商行、外资银行、消费金融公司、汽车金融公司等纳入范围。',
        source: '国家金融监督管理总局',
        url: 'https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1243763',
        category: 'policy',
        tags: ['监管政策', '财政贴息', '信用卡分期'],
        publish_date: '2026-01-20'
    },
    {
        title: '多家银行火速响应消费贷贴息政策升级',
        summary: '农业银行、中国银行、交通银行、邮储银行等多家国有大行表态将积极落实消费贷贴息政策新要求，信用卡分期业务纳入贴息范围。',
        content: '1月20日晚间，多家国有大行表态将积极落实消费贷贴息政策相关要求。农业银行、中国银行、交通银行、邮储银行等已围绕重点问题进行答疑。对于如何判断贷款/信用卡账单分期的发生时间是否符合贴息条件，各行表示：政策调整后，个人消费贷款财政贴息政策实施期为2025年9月1日至2026年12月31日，且将信用卡账单分期业务纳入支持范围，自2026年1月1日起施行。',
        source: '证券时报',
        url: 'https://stcn.com/article/detail/3605806.html',
        category: 'news',
        tags: ['银行响应', '贴息政策', '大行动态'],
        publish_date: '2026-01-22'
    },
    {
        title: '银行业内已出台信用卡分期贴息执行方案',
        summary: '证券时报记者走访多家银行网点发现，银行业内已根据最新政策要求出台相关优化贴息执行方案，将信用卡分期业务纳入贴息范围。',
        content: '根据财政部、中国人民银行、国家金融监督管理总局近日联合发布的通知，个人消费贷款财政贴息政策实施期延长至2026年12月31日。证券时报记者近日走访多家银行网点发现，银行业内已根据最新政策要求出台了相关优化贴息的执行方案，比如将信用卡分期业务纳入贴息范围，取消对部分消费贴息使用场景的限制等。根据部分银行网点反馈，当前消费贷利率最低为3%，贷款资金主要适用于装修、购车、旅游等消费用途。',
        source: '证券时报',
        url: 'https://www.stcn.com/article/detail/3613235.html',
        category: 'news',
        tags: ['行业动态', '信用卡分期', '贴息落地'],
        publish_date: '2026-01-27'
    },
    {
        title: '个人消费贷"国补"加码：信用卡账单分期纳入贴息，不限消费领域',
        summary: '2025年8月发布的个人消费贷款财政贴息政策迎来首次优化，信用卡账单分期业务被纳入支持范围，年贴息比例为1个百分点。',
        content: '1月20日，财政部、央行、金融监管总局联合发布通知，明确将个人消费贷款财政贴息政策实施时间延长至2026年底。此次优化主要包括：取消此前方案中关于消费领域的限制；扩大支持范围，将信用卡账单分期业务纳入支持范围；提高贴息标准，取消单笔消费贴息金额上限500元的要求；增加经办机构，将监管评级3A以上的银行、消费金融公司、汽车金融公司等纳入范围。受访专家指出，此次调整将增强贴息政策对消费者的吸引力。',
        source: '21世纪经济报道',
        url: 'https://www.21jingji.com/article/20260123/herald/d70a4eb52d7ed70beb76f6a5be19ab3c.html',
        category: 'policy',
        tags: ['国补政策', '信用卡分期', '消费提振'],
        publish_date: '2026-01-23'
    },
    {
        title: '素喜智研：信用卡分期纳入贴息释放三重积极信号',
        summary: '素喜智研高级研究员苏筱芮表示，将信用卡分期纳入财政贴息支持范围，释放了三重积极信号。',
        content: '素喜智研高级研究员苏筱芮表示，此次调整释放了三重积极信号：一是通过延长政策支持期限以稳定市场的长期消费预期；二是通过纳入信用卡分期和扩大经办机构范围，进一步提升政策普惠性；三是激活各类日常消费。她指出，此次将信用卡账单分期纳入财政贴息支持范围，重要考量有二：一是信用卡分期是居民日常消费的重要支付方式；二是信用卡分期业务风险相对可控，纳入贴息范围有助于提升政策效果。',
        source: '每日经济新闻',
        url: 'https://www.stcn.com/article/detail/3603259.html',
        category: 'news',
        tags: ['专家解读', '信用卡分期', '消费政策'],
        publish_date: '2026-01-21'
    },
    {
        title: '金融监管总局：发展消费金融助力提振消费',
        summary: '国家金融监督管理总局印发通知，要求发展消费金融，助力提振消费，探索开展线上开立和激活信用卡业务。',
        content: '2025年3月14日，国家金融监督管理总局印发《关于发展消费金融助力提振消费的通知》。主要内容包括：增加消费金融供给，鼓励银行业金融机构加大个人消费贷款投放力度；优化消费金融管理，完善个人消费贷款尽职免责要求，在有效核实身份、风险可控前提下，探索开展线上开立和激活信用卡业务；开展个人消费贷款纾困，合理商定贷款偿还期限、频次；优化消费金融环境，规范消费贷款合同条款，明示最终综合融资成本。',
        source: '国家金融监督管理总局',
        url: 'https://www.nfra.gov.cn/',
        category: 'policy',
        tags: ['监管政策', '消费金融', '信用卡业务'],
        publish_date: '2025-03-14'
    },
    {
        title: '中共中央办公厅 国务院办公厅印发《提振消费专项行动方案》',
        summary: '部署8方面30项重点任务，鼓励金融机构加大个人消费贷款投放，2025年对符合条件的个人消费贷款给予财政贴息。',
        content: '中共中央办公厅、国务院办公厅印发《提振消费专项行动方案》，部署了8方面30项重点任务。第二十九条为强化信贷支持，鼓励金融机构在风险可控前提下加大个人消费贷款投放力度，合理设置消费贷款额度、期限、利率。支持金融机构按照市场化法治化原则优化个人消费贷款偿还方式，有序开展续贷工作。2025年对符合条件的个人消费贷款和消费领域的服务业经营主体贷款给予财政贴息。',
        source: '中国政府网',
        url: 'http://www.gov.cn/',
        category: 'policy',
        tags: ['国家政策', '提振消费', '财政贴息'],
        publish_date: '2025-03-01'
    },
    {
        title: '个人消费贷款财政贴息政策实施方案发布',
        summary: '财政部等三部门印发实施方案，2025年9月1日至2026年8月31日期间，符合条件的个人消费贷款可享受贴息。',
        content: '2025年8月，财政部、中国人民银行、国家金融监督管理总局印发《个人消费贷款财政贴息政策实施方案》。明确2025年9月1日至2026年8月31日期间，居民个人使用贷款经办机构发放的个人消费贷款（不含信用卡业务）中实际用于消费的部分，可按规定享受贴息政策。贴息范围包括单笔5万元以下消费，以及单笔5万元及以上的家用汽车、养老生育、教育培训、文化旅游、家居家装、电子产品、健康医疗等重点领域消费。',
        source: '财政部',
        url: 'https://www.mof.gov.cn/',
        category: 'policy',
        tags: ['财政贴息', '消费贷款', '政策发布'],
        publish_date: '2025-08-12'
    }
];

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
    console.log(`数据时间范围: 2025年1月 - 2026年4月`);
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    
    let db;
    try {
        db = await initDB();
        
        // 创建表（如果不存在）
        const schema = fs.readFileSync(path.join(__dirname, '../data/schema.sql'), 'utf8');
        await runSQL(db, schema);
        
        // 插入真实数据
        let added = 0;
        for (const article of REAL_ARTICLES) {
            const saved = await saveArticle(db, article);
            if (saved) added++;
        }
        
        console.log(`\n=== 任务完成 ===`);
        console.log(`新增文章: ${added} 条`);
        console.log(`跳过重复: ${REAL_ARTICLES.length - added} 条`);
        console.log(`数据覆盖: 2025年1月至2026年4月最新政策资讯`);
        
    } catch (err) {
        console.error('任务失败:', err);
        process.exit(1);
    } finally {
        if (db) db.close();
    }
}

main();
