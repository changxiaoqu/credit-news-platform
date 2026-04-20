// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 2026年1-4月最新数据 - 摘要字数增加到300字以内
const initialData = [
    // ========== 监管政策 (policy) ==========
    {title: '三部门：个人消费贷款贴息政策延至2026年底，信用卡账单分期纳入支持范围', summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年12月31日，首次将信用卡账单分期业务纳入贴息支持范围，年贴息比例为1个百分点。取消单笔消费贴息500元上限，每名借款人每年累计贴息上限维持3000元，新增500多家经办机构。', source: '财政部/央行/金融监管总局', url: 'https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1243763', category: 'policy', tags: '["政策","消费贷款"]', publish_date: '2026-01-20'},
    {title: '《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施', summary: '2026年1月1日起，中国人民银行、国家金融监督管理总局、证监会三部门联合发布的《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施。将过去的“客户身份识别”升级为“客户尽职调查”，要求银行从静态的“核对身份证”转变为动态的“了解你的客户”，必须穿透识别受益所有人，并持续监测交易行为。', source: '央行/金融监管总局/证监会', url: 'https://www.pbc.gov.cn/', category: 'policy', tags: '["政策","反洗钱"]', publish_date: '2026-01-01'},
    {title: '国家金融监督管理总局北京监管局消费者风险提示：信用卡注销业务提示', summary: '近期，有消费者反映信用卡注销业务流程不顺畅。为切实维护金融消费者合法权益，引导消费者规范办理信用卡注销业务，国家金融监督管理总局北京监管局发布风险提示，提醒持卡人注意注销流程和时间节点。', source: 'ccb.com', url: 'https://www1.ccb.com/chn/2026-03/16/article_2026031615442923038.shtml', category: 'policy', tags: '["监管","政策"]', publish_date: '2026-03-16'},
    {title: '金融监管总局最新发声：助力乐购新春促消费', summary: '金融监管总局引导金融机构优化资源配置，加强金融产品和服务创新。今年初对贴息政策进行了调整优化，信用卡纳入消费贷款的贴息范围，力促消费升级和市场活跃。', source: 'jrj.sh.gov.cn', url: 'https://jrj.sh.gov.cn/ZXYW178/20260212/1c6c479c6d26429c8a6fc0ecea77ce32.html', category: 'policy', tags: '["监管","政策"]', publish_date: '2026-02-12'},
    {title: '六大行迅速发布信用卡分期贴息"指南"', summary: '1月20日，财政部、中国人民银行、国家金融监督管理总局发布《关于优化实施个人消费贷款财政贴息政策有关事项的通知》后，工行、农行、中行、建行、交行、邮储等六大行迅速响应，陆续发布信用卡分期贴息操作指南，落实具体办理流程。', source: 'jr.jl.gov.cn', url: 'https://jr.jl.gov.cn/jrzx/zyjrxxzz/gj/202601/t20260130_3551000.html', category: 'policy', tags: '["监管","政策"]', publish_date: '2026-01-30'},

    // ========== 行业资讯 - 2026年最新 ==========
    {title: '年内超45款信用卡被停发！信用卡发卡量三年锐减1.11亿张', summary: '2026年开年以来，农业银行、民生银行、交通银行、广发银行等多家银行密集发布公告，宣布停止发行多款信用卡产品。民生银行一次性叫停11款联名信用卡产品，农业银行先后停发饿了么联名卡等13款产品及大学生青春卡等多款卡种，交通银行、广发银行等也相继加入停发潮。据记者不完全统计，年内已有超过45款信用卡产品被停发。央行数据显示，截至2025年末，全国信用卡和借贷合一卡的数量已降至6.96亿张，较2022年三季度末8.07亿张的历史峰值累计减少1.11亿张，回到约七年前的水平。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: '["行业","停发潮"]', publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着2024年7月信用卡新规全面实施，银行业从过去的跑马圈地增量竞赛正式转入存量博弈时代。多场银行从冲量转向提质，清退低效产品、压降高风险客群、收紧授信门槛。2025年已有66家信用卡分中心关停，多家银行相继关停独立信用卡App，将功能迁移至手机银行。从国有大行到中小银行，信用卡业务正在经历深刻调整。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: '["行业","存量经营"]', publish_date: '2026-04-19'},
    {title: '2025年上市银行信用卡业务数据：发卡量跌破7亿张', summary: '13家A+H股上市银行2025年年报显示，截至2025年末累计发卡7.99亿张，较2024年减少约469.43万张。建设银行信用卡贷款余额同比减少568亿元，降幅达5.6%。工商银行信用卡不良率攀升至4.61%，较2024年末的3.5%大幅上升111个基点，整体行业面临资产质量压力。', source: '证券时报', url: 'https://www.stcn.com/article/detail/3757804.html', category: 'news', tags: '["行业","上市银行"]', publish_date: '2026-03-31'},

    // ========== 处罚数据 (risk) - 2026年最新 ==========
    {title: '建设银行信用卡中心被罚575.27万元', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.265231万元。违规行为涉及信用卡业务多个环节，反映出内控管理存在严重问题。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡中心"]', publish_date: '2026-03-23'},
    {title: '徽商银行南京分行被罚120万元', summary: '2026年3月13日，徽商银行股份有限公司南京分行因信用卡汽车分期业务管理不审慎、服务收费质价不符、贷后管理问题整改不到位，被江苏金融监管局罚款120万元。责任人苗睿（时任零售银行部总经理）被警告并罚款8万元，许逸被警告并罚款6万元。', source: '江苏金融监管局', url: 'https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1252207', category: 'risk', tags: '["处罚","信用卡分期"]', publish_date: '2026-03-13'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元', summary: '2026年一季度，中国人民银行、国家金融监督管理总局及各分局共开出处罚记录625条，罚单金额总计5.76亿元，涉及银行机构至少586家。信贷违规仍是“重灾区”，信用卡业务违规问题较为突出。反洗钱和数据安全领域处罚力度明显加码。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: '["处罚","监管"]', publish_date: '2026-04-01'},
    {title: '中国银行青海省分行信用卡业务管理不到位被罚55万元', summary: '2026年3月20日，中国银行青海省分行因信用卡业务管理不到位，���青海金融监管局罚款55万元。违规行为涉及信用卡授信管理、风险控制等方面的问题。', source: '青海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡业务"]', publish_date: '2026-03-20'},

    // ========== 商机信息 ==========
    // (商机信息数据暂时保留) (bid) - 2026年最新 ==========
    {title: '光大银行成都分行2026年4-12月信用卡场景流量获客项目', summary: '中国光大银行股份有限公司成都分行招标采购2026年4-12月信用卡场景流量获客服务，服务内容包括线下获客及活客活动、满减活动、分期营销活动、驻点服务、异业联盟场景营销、支行特色商圈配置等。', source: '四川东升项目管理', url: 'http://www.scdsxg.com/cms/news/1214.html', category: 'bid', tags: '["投标","光大银行"]', publish_date: '2026-03-18'},
    {title: '工商银行2026至2028年信用卡分期付款外呼项目', summary: '中国工商银行招标采购2026至2028年信用卡分期付款外呼服务，入围4家供应商，初始人员规模合计1100人。要求供应商具有金融行业呼叫中心服务经验，具备完善的质量管理体系。', source: '中信国际招标', url: 'https://www.bbda.com/bidDetail/0081fd592cd93bb6567cd7f303a4bab4ea86d46194a6d2d4d856ec9f2753a115.html', category: 'bid', tags: '["投标","工商银行"]', publish_date: '2025-11-18'},
    {title: '中信银行信用卡中心2026-2028年度前期电话催收业务外包项目', summary: '中信银行股份有限公司信用卡中心招标采购2026-2028年度前期电话催收业务外包服务，要求供应商具有独立法人资格，持有有效期内的《增值电信业务经营许可证》（含呼叫中心业务）。', source: '中信银行信用卡中心', url: 'https://www.bbda.com/bidDetail/4aaf8cca31bdd7890043fd5806ad8d3d24fe72083f46d47adaf721b7642d4016.html', category: 'bid', tags: '["投标","中信银行"]', publish_date: '2025-11-21'},
    {title: '邮储银行北京分行2026年信用卡业务营销活动服务采购项目', summary: '中国邮政储蓄银行股份有限公司北京分行采购两家信用卡业务营销服务商，配合开展2026年信用卡业务营销活动。服务内容包括线下获客活动、线上与线下营销活动策划与执行、权益配置等。', source: '中国邮政集团', url: 'https://www.chinapost.com.cn/html1/report/2603/3199-1.htm', category: 'bid', tags: '["投标","邮储银行"]', publish_date: '2026-03-09'},
    {title: '建设银行山东省分行2026年信用卡消费促销系列活动服务采购项目', summary: '中国建设银行股份有限公司山东省分行通过公开招标方式选取信用卡消费促销系列活动服务商，采购价格有效期1年，中标人与山东省分行签订框架采购合同。', source: '山东省鲁成招标', url: 'https://www.bbda.com/bidDetail/5864d5e3702b5a2aa8a4c5eab4767be74ee653b181edfde5d079a98b5083c293.html', category: 'bid', tags: '["投标","建设银行"]', publish_date: '2025-12-18'},
    {title: '光大银行武汉分行2026年上半年信用卡数字化渠道获客业务采购项目', summary: '中国光大银行股份有限公司武汉分行采购2026年上半年信用卡数字化渠道获客服务，中标供应商为中盛供应链（深圳）有限公司，高端卡报价370元/户，中端卡报价195元/户，服务期6个月。', source: '湖北省招标股份有限公司', url: 'https://www.hbbidding.com.cn/view/22778.html', category: 'bid', tags: '["投标","光大银行"]', publish_date: '2025-12-24'},
    {title: '2026年建行银联信用卡分行特惠场景活动宣传服务商采购', summary: '中国银联采购1家服务商，为建行银联信用卡分行特惠场景活动提供全周期统筹落地与全方位宣传推广服务，包括活动策划实施、宣传物料设计制作配送、多渠道媒体资源投放等。', source: '中国银联', url: 'https://zaoyangshi.jrzb.com/purchases/2026-04-11.3d43cb0838050ca6450f37ca64fc560b', category: 'bid', tags: '["投标","中国银联"]', publish_date: '2026-04-11'},
    {title: '江苏省联社新核心业务系统项目测试服务招标公告', summary: '江苏省农村信用社联合社新核心业务系统项目测试服务招标，对投标人资质要求包括资产规模超过1万亿元的城商行合作案例，如杭州银行、宁波银行、长沙银行、重庆农村商业银行等。', source: 'js96008.com', url: 'http://www.js96008.com/cn/khfw/zxgg/2893.html', category: 'bid', tags: '["投标","省联社"]', publish_date: '2026-04-09'},
    {title: '广东南粤银行2026-2027年通用数据开发服务项目', summary: '广东南粤银行2026-2027年通用数据开发服务项目招标，要求投标人与城商行、农商行总行合作的数据开发类案例不少于3个，具有相关技术资质和项目经验。', source: 'gdnybank.com', url: 'https://www.gdnybank.com/nygg/20260401/38232.html', category: 'bid', tags: '["城商行","招标"]', publish_date: '2026-04-01'},
    {title: '广州银行银行卡卡片制作及个人化外包服务采购项目', summary: '广州银行银行卡卡片制作及个人化外包服务采购项目招标，采购内容包含银行卡卡片制作、的个人化数据处理、卡片封装快递等服务。', source: '广州银行', url: 'https://www.gzbank.com.cn/', category: 'bid', tags: '["城商行","卡片制作"]', publish_date: '2026-03-30'},
    {title: '中国建设银行四川省分行2026年信用卡逾期欠款委外催收外包项目', summary: '中国建设银行四川省分行2026年信用卡逾期欠款委外催收外包项目招标，主要针对逾期信用卡账户进行专业催收服务，要求供应商具有相关金融外包服务资质。', source: '建设银行四川分行', url: 'https://www.ccb.com/scn/', category: 'bid', tags: '["投标","建设银行"]', publish_date: '2026-03-25'},
    {title: '湖南银行2026年信用卡线上营销活动项目', summary: '湖南银行2026年信用卡线上营销活动项目招标，旨在提升信用卡客户活跃度和消费金额，包含线上渠道获客、精准营销、活动策划等服务内容。', source: '湖南银行', url: 'https://www.hunanbank.com.cn/', category: 'bid', tags: '["投标","湖南银行"]', publish_date: '2026-04-07'}
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

                db.run(`DELETE FROM articles WHERE category IN ('news', 'business', 'industry', 'opportunity')`, [], function(err) {
                    if (err) console.error('Delete error:', err);
                    else console.log('✅ 已清除旧数据');

                    let inserted = 0;
                    const stmt = db.prepare(`INSERT OR REPLACE INTO articles (title, summary, source, url, category, tags, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                    
                    initialData.forEach(article => {
                        stmt.run([article.title, article.summary, article.source, article.url, article.category, article.tags, article.publish_date], function(err) {
                            if (err) console.error('Insert error:', err.message);
                            else inserted++;

                            if (inserted === initialData.length) {
                                stmt.finalize();
                                console.log(`✅ 数据初始化完成: 新增 ${inserted} 条`);
                                db.all(`SELECT category, COUNT(*) as count FROM articles GROUP BY category`, [], (err, rows) => {
                                    rows.forEach(row => console.log(`   - ${row.category}: ${row.count} 条`));
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
    initData().then(() => process.exit(0)).catch(err => { console.error('初始化失败:', err); process.exit(1); });
}

module.exports = { initData };