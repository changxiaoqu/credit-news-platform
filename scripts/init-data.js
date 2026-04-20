// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 2026年1-4月最新数据 - 每次部署都会更新
const initialData = [
    // ========== 监管政策 (policy) ==========
    {title: '三部门：个人消费贷款贴息政策延至2026年底，信用卡账单分期纳入支持范围', summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年12月31日，首次将信用卡账单分期业务纳入贴息支持范围，年贴息比例为1个百分点。', source: '财政部/央行/金融监管总局', url: 'https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1243763', category: 'policy', tags: '["政策","消费贷款"]', publish_date: '2026-01-20'},
    {title: '《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施', summary: '2026年1月1日正式实施，将"客户身份识别"升级为"客户尽职调查"，要求银行穿透识别受益所有人。', source: '央行/金融监管总局/证监会', url: 'https://www.pbc.gov.cn/', category: 'policy', tags: '["政策","反洗钱"]', publish_date: '2026-01-01'},
    {title: '国家金融监督管理总局北京监管局消费者风险提示：信用卡注销业务提示', summary: '引导消费者规范办理信用卡注销业务。', source: 'ccb.com', url: 'https://www1.ccb.com/chn/2026-03/16/article_2026031615442923038.shtml', category: 'policy', tags: '["监管","政策"]', publish_date: '2026-03-16'},
    {title: '金融监管总局最新发声：助力乐购新春促消费', summary: '金融监管总局引导金融机构优化资源配置，加强金融产品和服务创新。', source: 'jrj.sh.gov.cn', url: 'https://jrj.sh.gov.cn/ZXYW178/20260212/1c6c479c6d26429c8a6fc0ecea77ce32.html', category: 'policy', tags: '["监管","政策"]', publish_date: '2026-02-12'},
    {title: '六大行迅速发布信用卡分期贴息"指南"', summary: '六大行迅速响应发布信用卡分期贴息指南。', source: 'jr.jl.gov.cn', url: 'https://jr.jl.gov.cn/jrzx/zyjrxxzz/gj/202601/t20260130_3551000.html', category: 'policy', tags: '["监管","政策"]', publish_date: '2026-01-30'},

    // ========== 行业资讯 - 2026年最新 ==========
    // 注意：前端分类用的是 'news'
    {title: '年内超45款信用卡被停发！信用卡发卡量三年锐减1.11亿张', summary: '2026年开年以来，多家银行密集停发信用卡产品。央行数据显示，截至2025年末全国信用卡和借贷合一卡数量降至6.96亿张。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: '["行业","停发潮"]', publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着信用卡新规全面实施，银行业从增量竞赛转入存量博弈时代。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: '["行业","存量经营"]', publish_date: '2026-04-19'},
    {title: '2025年上市银行信用卡业务数据：发卡量跌破7亿张', summary: '13家A+H股上市银行2025年年报显示，累计发卡7.99亿张，较2024年减少约469.43万张。', source: '证券时报', url: 'https://www.stcn.com/article/detail/3757804.html', category: 'news', tags: '["行业","上市银行"]', publish_date: '2026-03-31'},

    // ========== 处罚数据 (risk) - 2026年最新 ==========
    {title: '建设银行信用卡中心被罚575.27万元', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则等14项违规，被上海金融监管局罚没575.27万元。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡中心"]', publish_date: '2026-03-23'},
    {title: '徽商银行南京分行被罚120万元', summary: '2026年3月13日，徽商银行南京分行因信用卡汽车分期业务管理不审慎被江苏金融监管局罚款120万元。', source: '江苏金融监管局', url: 'https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1252207', category: 'risk', tags: '["处罚","信用卡分期"]', publish_date: '2026-03-13'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元', summary: '2026年一季度罚单金额总计5.76亿元，涉及银行机构至少586家。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: '["处罚","监管"]', publish_date: '2026-04-01'},
    {title: '中国银行青海省分行信用卡业务管理不到位被罚55万元', summary: '2026年3月20日，中国银行青海省分行因信用卡业务管理不到位被罚55万元。', source: '青海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡业务"]', publish_date: '2026-03-20'},

    // ========== 商机信息 ==========
    // 注意：前端分类用的是 'business'
    {title: '场景金融：信用卡业务从"发卡"转向"场景获客"', summary: '场景金融成为信用卡获客和活客的核心抓手，包括线下商超、餐饮、文旅、出行等高频消费场景。', source: '行业研究', url: 'https://credit-news-platform-production-6acb.up.railway.app/', category: 'business', tags: '["商机","场景金融"]', publish_date: '2026-04-01'},
    {title: '数字化创新：AI+大数据赋能信用卡风控与营销', summary: '信用卡行业数字化转型加速，AI大模型、大数据风控、智能营销成为竞争焦点。', source: '行业研究', url: 'https://credit-news-platform-production-6acb.up.railway.app/', category: 'business', tags: '["商机","数字化"]', publish_date: '2026-04-01'},
    {title: '不良资产处置：信用卡不良资产批量转让市场升温', summary: '2026年1月个人不良贷款批量转让市场持续升温，信用卡不良资产转让成为银行出清风险的常规渠道。', source: '银登中心', url: 'https://www.nfra.gov.cn/', category: 'business', tags: '["商机","不良资产"]', publish_date: '2026-04-01'},

    // ========== 投标信息 (bid) - 2026年最新 ==========
    {title: '光大银行成都分行2026年4-12月信用卡场景流量获客项目', summary: '光大银行成都分行招标采购信用卡场景流量获客服务。', source: '四川东升项目管理', url: 'http://www.scdsxg.com/cms/news/1214.html', category: 'bid', tags: '["投标","光大银行"]', publish_date: '2026-03-18'},
    {title: '工商银行2026至2028年信用卡分期付款外呼项目', summary: '工商银行招标采购信用卡分期付款外呼服务，入围4家供应商。', source: '中信国际招标', url: 'https://www.bbda.com/bidDetail/0081fd592cd93bb6567cd7f303a4bab4ea86d46194a6d2d4d856ec9f2753a115.html', category: 'bid', tags: '["投标","工商银行"]', publish_date: '2025-11-18'},
    {title: '中信银行信用卡中心2026-2028年度前期电话催收业务外包项目', summary: '中信银行信用卡中心招标采购电话催收业务外包服务。', source: '中信银行信用卡中心', url: 'https://www.bbda.com/bidDetail/4aaf8cca31bdd7890043fd5806ad8d3d24fe72083f46d47adaf721b7642d4016.html', category: 'bid', tags: '["投标","中信银行"]', publish_date: '2025-11-21'},
    {title: '邮储银行北京分行2026年信用卡业务营销活动服务采购项目', summary: '邮储银行北京分行采购两家信用卡业务营销服务商。', source: '中国邮政集团', url: 'https://www.chinapost.com.cn/html1/report/2603/3199-1.htm', category: 'bid', tags: '["投标","邮储银行"]', publish_date: '2026-03-09'},
    {title: '建设银行山东省分行2026年信用卡消费促销系列活动服务采购项目', summary: '建设银行山东省分行选取信用卡消费促销系列活动服务商。', source: '山东省鲁成招标', url: 'https://www.bbda.com/bidDetail/5864d5e3702b5a2aa8a4c5eab4767be74ee653b181edfde5d079a98b5083c293.html', category: 'bid', tags: '["投标","建设银行"]', publish_date: '2025-12-18'},
    {title: '光大银行武汉分行2026年上半年信用卡数字化渠道获客业务采购项目', summary: '光大银行武汉分行采购信用卡数字化渠道获客服务。', source: '湖北省招标股份有限公司', url: 'https://www.hbbidding.com.cn/view/22778.html', category: 'bid', tags: '["投标","光大银行"]', publish_date: '2025-12-24'},
    {title: '2026年建行银联信用卡分行特惠场景活动宣传服务商采购', summary: '中国银联采购建行银联信用卡分行特惠场景活动宣传服务商。', source: '中国银联', url: 'https://zaoyangshi.jrzb.com/purchases/2026-04-11.3d43cb0838050ca6450f37ca64fc560b', category: 'bid', tags: '["投标","中国银联"]', publish_date: '2026-04-11'},
    {title: '江苏省联社新核心业务系统项目测试服务招标公告', summary: '江苏省联社新核心业务系统项目测试服务招标公告。', source: 'js96008.com', url: 'http://www.js96008.com/cn/khfw/zxgg/2893.html', category: 'bid', tags: '["投标","省联社"]', publish_date: '2026-04-09'},
    {title: '广东南粤银行2026-2027年通用数据开发服务项目', summary: '广东南粤银行通用数据开发服务项目招标。', source: 'gdnybank.com', url: 'https://www.gdnybank.com/nygg/20260401/38232.html', category: 'bid', tags: '["城商行","招标"]', publish_date: '2026-04-01'},
    {title: '广州银行银行卡卡片制作及个人化外包服务采购项目', summary: '广州银行银行卡卡片制作及个人化外包服务采购项目招标。', source: '广州银行', url: 'https://www.gzbank.com.cn/', category: 'bid', tags: '["城商行","卡片制作"]', publish_date: '2026-03-30'},
    {title: '中国建设银行四川省分行2026年信用卡逾期欠款委外催收外包项目', summary: '建设银行四川分行信用卡逾期欠款委外催收外包项目招标。', source: '建设银行四川分行', url: 'https://www.ccb.com/scn/', category: 'bid', tags: '["投标","建设银行"]', publish_date: '2026-03-25'},
    {title: '湖南银行2026年信用卡线上营销活动项目', summary: '湖南银行2026年信用卡线上营销活动项目招标。', source: '湖南银行', url: 'https://www.hunanbank.com.cn/', category: 'bid', tags: '["投标","湖南银行"]', publish_date: '2026-04-07'}
];

function initData() {
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }

        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }

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
            `;

            db.exec(schema, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // 先删除旧的news和business分类数据，确保干净的数据
                db.run(`DELETE FROM articles WHERE category IN ('news', 'business', 'industry', 'opportunity')`, [], function(err) {
                    if (err) {
                        console.error('Delete error:', err);
                    } else {
                        console.log('✅ 已清除旧数据');
                    }

                    // 插入新数据
                    let inserted = 0;
                    const stmt = db.prepare(`INSERT INTO articles (title, summary, source, url, category, tags, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                    
                    initialData.forEach(article => {
                        stmt.run([article.title, article.summary, article.source, article.url, article.category, article.tags, article.publish_date], function(err) {
                            if (err) {
                                console.error('Insert error:', err.message);
                            } else {
                                inserted++;
                            }

                            if (inserted === initialData.length) {
                                stmt.finalize();
                                console.log(`✅ 数据初始化完成: 新增 ${inserted} 条`);
                                console.log(`📊 数据分类:`);
                                db.all(`SELECT category, COUNT(*) as count FROM articles GROUP BY category`, [], (err, rows) => {
                                    rows.forEach(row => {
                                        console.log(`   - ${row.category}: ${row.count} 条`);
                                    });
                                    db.close();
                                    resolve({ inserted });
                                });
                            }
                        });
                    });
                });
            });
        });
    });
}

if (require.main === module) {
    initData()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('初始化失败:', err);
            process.exit(1);
        });
}

module.exports = { initData };