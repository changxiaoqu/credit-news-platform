#!/usr/bin/env node
/**
 * 批量导入最新信用卡资讯到数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/news.db');

// 最新监管政策
const policyData = [
    {
        title: "透视信用卡2025年：瘦身与退场，走向两极分化",
        summary: "2025年信用卡行业经历着割裂式变革，央行《2025年支付体系运行总体情况》显示，2025年末信用卡规模跌破7亿张关口至6.96亿张，较2022年三季度的历史高点减少约1.11亿张。",
        source: "新浪财经",
        url: "https://finance.sina.com.cn/roll/2026-04-08/doc-inhtucsa2857665.shtml",
        category: "policy",
        tags: ["信用卡", "监管", "行业趋势"],
        publish_date: "2026-04-08",
        is_important: true,
        is_key_policy: true
    },
    {
        title: "财政部 中国人民银行 金融监管总局关于优化实施个人消费贷款财政贴息政策有关事项的通知",
        summary: "将信用卡账单分期业务纳入财政贴息支持范围，年贴息比例为1个百分点。取消单笔消费贴息金额上限500元的要求，政策实施期延长至2026年12月31日。",
        source: "国家金融监督管理总局",
        url: "https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1243763",
        category: "policy",
        tags: ["信用卡", "财政贴息", "消费贷", "监管政策"],
        publish_date: "2026-01-20",
        is_important: true,
        is_key_policy: true,
        policy_no: "财金〔2026〕1号",
        issuing_authority: "财政部、中国人民银行、金融监管总局",
        effective_date: "2026-01-01",
        policy_level: "部门规章",
        key_points: "1.信用卡账单分期纳入贴息范围，年贴息1%；2.取消单笔500元贴息上限；3.政策延长至2026年底；4.增加城商行、农商行、消费金融公司为经办机构"
    },
    {
        title: "多家银行发文明确信用卡账单分期贴息细节，开启补申请通道",
        summary: "财政部等三部门联合印发通知，明确优化实施个人消费贷款财政贴息政策。工商银行、农业银行、中国银行、建设银行、交通银行、邮储银行、招商银行等多家机构发文，对贴息服务落地安排进行介绍和答疑。",
        source: "北京商报",
        url: "https://www.bbtnews.com.cn/2026/0122/582600.shtml",
        category: "policy",
        tags: ["信用卡", "财政贴息", "银行"],
        publish_date: "2026-01-22",
        is_important: true,
        is_key_policy: false
    }
];

// 最新行业资讯
const newsData = [
    {
        title: "2025银行年报观察室｜信用卡跌破7亿张：大行发卡量踩刹车",
        summary: "截至2025年末，全国信用卡和借贷合一卡在用发卡量为6.96亿张，为2022年达到峰值后首次跌破7亿张。交通银行、邮储银行累计发卡量降幅超5%，信用卡贷款余额集体负增长。",
        source: "北京商报",
        url: "http://www.bbtnews.com.cn/2026/0407/589850.shtml",
        category: "news",
        tags: ["信用卡", "银行年报", "发卡量"],
        publish_date: "2026-04-07",
        is_important: true
    },
    {
        title: "跌破7亿张！银行信用卡业务深度调整，不良处置全面提速",
        summary: "央行数据显示，截至2025年第四季度末，全国信用卡和借贷合一卡存量降至6.96亿张，较2024年末减少约3100万张。2025年已有交通银行、民生银行、广发银行等合计66家信用卡分中心终止营业。",
        source: "证券时报",
        url: "http://wxly.p5w.net/news/6440003.html",
        category: "news",
        tags: ["信用卡", "不良处置", "分中心关闭"],
        publish_date: "2026-02-28",
        is_important: true
    },
    {
        title: "银行个贷不良压力骤升，信用卡不良率2025年最高达4.6%",
        summary: "工商银行2025年信用卡不良贷款率达到4.61%，上升1.11个百分点。民生银行也到了3.87%。信用卡行业发卡量连续多年下滑，商业银行不再单纯追求发卡规模。",
        source: "21世纪经济报道",
        url: "https://www.21jingji.com/article/20260409/herald/961e272894bbf047f7e032e6e2e8c9e4.html",
        category: "news",
        tags: ["信用卡", "不良率", "风险"],
        publish_date: "2026-04-09",
        is_important: true
    },
    {
        title: "先睹为快｜部分全国性银行2025信用卡数据速览与简析",
        summary: "截至2025年末，我国信用卡及借贷合一卡存量为6.96亿张。招商银行信用卡收入连续五年以超过800亿元的成绩位居首位，其中利息收入596.6亿元，非利息收入203.53亿元。",
        source: "中国电子银行网",
        url: "https://www.cebnet.com.cn/20260403/103002005.html",
        category: "news",
        tags: ["信用卡", "银行数据", "年报"],
        publish_date: "2026-04-03",
        is_important: true
    }
];

// 最新处罚数据
const riskData = [
    {
        title: "建设银行信用卡中心被罚没575万元",
        summary: "中国建设银行股份有限公司信用卡中心因客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.265231万元。",
        source: "上海金融监管局",
        url: "https://finance.sina.com.cn/jjxw/2026-03-23/doc-inhryhiv4140809.shtml",
        category: "risk",
        tags: ["信用卡", "处罚", "风控"],
        publish_date: "2026-03-23",
        is_important: true,
        penalized_institution: "中国建设银行股份有限公司信用卡中心",
        institution_level: "总行",
        parent_bank: "建设银行",
        bank_type: "国有大行",
        penalty_authority: "上海金融监管局",
        penalty_date: "2026-03-23",
        penalty_amount: 575.27,
        penalty_document_no: "沪金罚决字〔2026〕45号",
        penalty_reason: "客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则、信用卡透支资金管理严重违反审慎经营规则、对高风险持卡人未采取审慎监管措施、向关系人发放信用贷款、未经资格认定从事信用卡发卡营销活动、信用卡发放严重违反审慎经营规则、预借现金分期业务严重违反审慎经营规则、可疑交易账户管理严重违反审慎经营规则、未按规定退还分期利息、发卡业务管理严重违反审慎经营规则、信用卡催收外包管理严重违反审慎经营规则、收单商户准入管理不到位"
    },
    {
        title: "中信银行杭州分行被罚625万元",
        summary: "中信银行杭州分行由于贷款管理不审慎、票据业务管理不到位等，被浙江金融监管局罚款625万元，相关负责人邵炳斌、袁佳等14人被警告。",
        source: "浙江金融监管局",
        url: "https://finance.sina.cn/2026-04-10/detail-inhtyfhe1477268.d.html",
        category: "risk",
        tags: ["信用卡", "贷款管理", "处罚"],
        publish_date: "2026-02-06",
        is_important: true,
        penalized_institution: "中信银行股份有限公司杭州分行",
        institution_level: "分行",
        parent_bank: "中信银行",
        bank_type: "股份行",
        penalty_authority: "浙江金融监管局",
        penalty_date: "2026-02-06",
        penalty_amount: 625,
        penalty_document_no: "浙金罚决字〔2026〕XX号",
        penalty_reason: "贷款管理不审慎、票据业务管理不到位"
    },
    {
        title: "中国银行2026年以来已收到25张罚单累计罚没超1180万元",
        summary: "2026年以来截至3月8日，涉及中国银行及其分支机构的罚单有25张，罚没金额合计超过1180万元。其中中国银行云南省分行因信用卡透支资金用途管控不力等被罚款355万元。",
        source: "凤凰网",
        url: "https://h5.ifeng.com/c/vivoArticle/v002KtytM5cNM1vVYcK--nMzYqD5l3kmkE4ErAsQrspv98vI__",
        category: "risk",
        tags: ["信用卡", "处罚", "中国银行"],
        publish_date: "2026-03-09",
        is_important: true,
        penalized_institution: "中国银行股份有限公司云南省分行",
        institution_level: "分行",
        parent_bank: "中国银行",
        bank_type: "国有大行",
        penalty_authority: "云南金融监管局",
        penalty_date: "2026-01-24",
        penalty_amount: 355,
        penalty_document_no: "云金罚决字〔2026〕XX号",
        penalty_reason: "未按公示的收费价目名录收费、未与小微企业分担应共同承担的保险费用、贷款管理不审慎、信用卡透支资金用途管控不力"
    }
];

// 最新投标信息
const bidData = [
    {
        title: "广东南粤银行新信贷系统测试服务项目招标公告",
        summary: "广东南粤银行股份有限公司就新信贷系统测试服务项目进行公开招标，要求投标人具备国内商业银行总行级别信贷系统测试服务项目案例。",
        source: "广东南粤银行",
        url: "https://www.gdnybank.com/nygg/20260325/38192.html",
        category: "bid",
        tags: ["信贷系统", "测试服务", "城商行"],
        publish_date: "2026-03-25",
        is_important: true,
        project_name: "新信贷系统测试服务项目",
        procuring_entity: "广东南粤银行股份有限公司",
        procuring_level: "总行",
        bank_type: "城商行",
        budget: "未公开",
        bid_deadline: "2026-04-01",
        bid_status: "招标中",
        core_requirements: "投标人2022年1月1日起至少具备一个独立承接国内商业银行总行级别银行业新一代信贷系统测试服务项目案例，公司人数规模3000人以上"
    }
];

// 最新商机信息
const businessData = [
    {
        title: "上海浦东发展银行总行信用卡前置系统信创改造项目及信用卡2025年敏态项目开发服务采购",
        summary: "浦发银行就信用卡前置系统信创改造项目及2025年敏态项目开发服务进行供应商征集，涉及银联接入交易JSON报文适配改造、信用卡前置系统信创改造等。",
        source: "上海浦东发展银行",
        url: "https://www.bbda.com/bidDetail/4f33ff62965b77d0aa855c8aa62b8129",
        category: "business",
        tags: ["信用卡", "信创改造", "系统开发"],
        publish_date: "2025-07-25",
        is_important: true,
        project_name: "信用卡前置系统信创改造项目及信用卡2025年敏态项目开发服务",
        procuring_entity: "上海浦东发展银行股份有限公司",
        procuring_level: "总行",
        bank_type: "股份行",
        core_requirements: "1.银联接入交易JSON报文适配改造；2.信用卡前置系统信创改造，包含数据库、应用软件、PaaS服务、负载均衡、对象存储、前端浏览器适配；3.投标人需具备银行业前置类系统成功案例"
    }
];

// 合并所有数据
const allData = [...policyData, ...newsData, ...riskData, ...bidData, ...businessData];

// 初始化数据库
function initDB() {
    return new Promise((resolve, reject) => {
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
        INSERT INTO articles (
            title, summary, content, source, url, category, tags, publish_date,
            is_important, is_key_policy, policy_no, issuing_authority, effective_date, policy_level, key_points,
            penalized_institution, institution_level, parent_bank, bank_type, penalty_authority, penalty_date, penalty_amount, penalty_document_no, penalty_reason,
            project_name, procuring_entity, procuring_level, budget, bid_deadline, bid_status, core_requirements, winner, winner_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [
            article.title,
            article.summary,
            article.content || article.summary,
            article.source,
            article.url,
            article.category,
            JSON.stringify(article.tags || []),
            article.publish_date,
            article.is_important ? 1 : 0,
            article.is_key_policy ? 1 : 0,
            article.policy_no || null,
            article.issuing_authority || null,
            article.effective_date || null,
            article.policy_level || null,
            article.key_points || null,
            article.penalized_institution || null,
            article.institution_level || null,
            article.parent_bank || null,
            article.bank_type || null,
            article.penalty_authority || null,
            article.penalty_date || null,
            article.penalty_amount || null,
            article.penalty_document_no || null,
            article.penalty_reason || null,
            article.project_name || null,
            article.procuring_entity || null,
            article.procuring_level || null,
            article.budget || null,
            article.bid_deadline || null,
            article.bid_status || null,
            article.core_requirements || null,
            article.winner || null,
            article.winner_amount || null
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

// 主函数
async function main() {
    console.log('='.repeat(60));
    console.log('📊 批量导入最新信用卡资讯');
    console.log('='.repeat(60));
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    console.log(`数据条数: ${allData.length}`);
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
                is_important INTEGER DEFAULT 0,
                is_key_policy INTEGER DEFAULT 0,
                policy_no TEXT,
                issuing_authority TEXT,
                effective_date TEXT,
                policy_level TEXT,
                key_points TEXT,
                penalized_institution TEXT,
                institution_level TEXT,
                parent_bank TEXT,
                bank_type TEXT,
                penalty_authority TEXT,
                penalty_date TEXT,
                penalty_amount REAL,
                penalty_document_no TEXT,
                penalty_reason TEXT,
                project_name TEXT,
                procuring_entity TEXT,
                procuring_level TEXT,
                budget TEXT,
                bid_deadline TEXT,
                bid_status TEXT,
                core_requirements TEXT,
                winner TEXT,
                winner_amount TEXT
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
        
        // 按分类导入数据
        const categories = {
            '监管政策': policyData,
            '行业资讯': newsData,
            '处罚数据': riskData,
            '投标信息': bidData,
            '商机信息': businessData
        };
        
        for (const [catName, catData] of Object.entries(categories)) {
            if (catData.length === 0) continue;
            
            console.log(`\n📁 ${catName} (${catData.length}条)`);
            console.log('-'.repeat(40));
            
            for (const article of catData) {
                const saved = await saveArticle(db, article);
                if (saved) {
                    totalAdded++;
                } else {
                    totalSkipped++;
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 导入完成');
        console.log('='.repeat(60));
        console.log(`   新增: ${totalAdded} 条`);
        console.log(`   跳过: ${totalSkipped} 条`);
        console.log('');
        
    } catch (err) {
        console.error('❌ 导入失败:', err);
        process.exit(1);
    } finally {
        if (db) db.close();
    }
}

main();
