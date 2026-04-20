// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 2026年1-4月最新数据 - 每次部署都会更新
const initialData = [
    // ========== 监管政策 (policy) ==========
    {title: '三部门：个人消费贷款贴息政策延至2026年底，信用卡账单分期纳入支持范围', summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年12月31日，首次将信用卡账单分期业务纳入贴息支持范围，年贴息比例为1个百分点。取消单笔消费贴息500元上限，每名借款人每年累计贴息上限维持3000元。', source: '财政部/央行/金融监管总局', url: 'https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1243763', category: 'policy', tags: JSON.stringify(['政策', '消费贷款', '信用卡分期', '贴息']), publish_date: '2026-01-20'},
    {title: '《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施', summary: '中国人民银行、国家金融监督管理总局、证监会三部门联合发布的《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》于2026年1月1日正式实施，将"客户身份识别"升级为"客户尽职调查"，要求银行穿透识别受益所有人并持续监测交易行为。', source: '央行/金融监管总局/证监会', url: 'https://www.pbc.gov.cn/', category: 'policy', tags: JSON.stringify(['政策', '反洗钱', '客户尽职调查']), publish_date: '2026-01-01'},
    {title: '国家金融监督管理总局北京监管局消费者风险提示：信用卡注销业务提示', summary: '近期，有消费者反映信用卡注销业务流程不顺畅。为切实维护金融消费者合法权益，引导消费者规范办理信用卡注销业务。', source: 'ccb.com', url: 'https://www1.ccb.com/chn/2026-03/16/article_2026031615442923038.shtml', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2026-03-16'},
    {title: '金融监管总局最新发声：助力乐购新春促消费', summary: '金融监管总局引导金融机构优化资源配置，加强金融产品和服务创新。今年初对贴息政策进行了调整优化，信用卡纳入消费贷款的贴息范围。', source: 'jrj.sh.gov.cn', url: 'https://jrj.sh.gov.cn/ZXYW178/20260212/1c6c479c6d26429c8a6fc0ecea77ce32.html', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2026-02-12'},
    {title: '六大行迅速发布信用卡分期贴息"指南"', summary: '1月20日，财政部、中国人民银行、国家金融监督管理总局发布《关于优化实施个人消费贷款财政贴息政策有关事项的通知》后，六大行迅速响应发布指南。', source: 'jr.jl.gov.cn', url: 'https://jr.jl.gov.cn/jrzx/zyjrxxzz/gj/202601/t20260130_3551000.html', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2026-01-30'},
    {title: '3月信用卡相关监管政策一览', summary: '《国家金融监督管理总局关于发展消费金融助力提振消费的通知》印发，增加消费金融供给。', source: 'sohu.com', url: 'https://www.sohu.com/a/878892714_659885', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2025-04-02'},

    // ========== 行业资讯 - 2026年最新 ==========
    // 前端分类用的是 'news'
    {title: '年内超45款信用卡被停发！信用卡发卡量三年锐减1.11亿张', summary: '2026年开年以来，农业银行、民生银行、交通银行、广发银行等多家银行密集发布公告，宣布停止发行多款信用卡产品。央行数据显示，截至2025年末，全国信用卡和借贷合一卡数量降至6.96亿张，较2022年三季度末8.07亿张的历史峰值累计减少1.11亿张，回到约7年前水平。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: JSON.stringify(['行业', '停发潮', '发卡量']), publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着2024年7月信用卡新规全面实施，银行业从过去的跑马圈地增量竞赛，正式转入存量博弈时代。多家银行从冲量转向提质，清退低效产品、压降高风险客群、收紧授信门槛。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: JSON.stringify(['行业', '存量经营', '业务转型']), publish_date: '2026-04-19'},
    {title: '2025年上市银行信用卡业务数据：发卡量跌破7亿张', summary: '13家A+H股上市银行2025年年报显示，截至2025年末累计发卡7.99亿张，较2024年减少约469.43万张。建设银行信用卡贷款余额同比减少568亿元，降幅达5.6%。', source: '证券时报', url: 'https://www.stcn.com/article/detail/3757804.html', category: 'news', tags: JSON.stringify(['行业', '上市银行', '年报数据']), publish_date: '2026-03-31'},

    // ========== 处罚数据 (risk) - 2026年最新 ==========
    {title: '建设银行信用卡中心被罚575.27万元：涉客户资信调查、授信额度管理等14项违规', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.27万元。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: JSON.stringify(['处罚', '信用卡中心', '审慎经营']), publish_date: '2026-03-23'},
    {title: '徽商银行南京分行被罚120万元：信用卡汽车分期业务管理不审慎', summary: '2026年3月13日，徽商银行股份有限公司南京分行因信用卡汽车分期业务管理不审慎、服务收费质价不符、贷后管理问题整改不到位，被江苏金融监管局罚款120万元。责任人苗睿被警告并罚款8万元，许逸被警告并罚款6万元。', source: '江苏金融监管局', url: 'https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1252207', category: 'risk', tags: JSON.stringify(['处罚', '信用卡分期', '汽车分期']), publish_date: '2026-03-13'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元，信用卡违规突出', summary: '2026年一季度，中国人民银行、国家金融监督管理总局及各分局共开出处罚记录625条，罚单金额总计5.76亿元，涉及银行机构至少586家。信贷违规仍是"重灾区"，信用卡业务违规问题较为突出。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: JSON.stringify(['处罚', '监管处罚', '一季度']), publish_date: '2026-04-01'},
    {title: '中国银行青海省分行信用卡业务管理不到位被罚55万元', summary: '2026年3月20日，中国银行青海省分行因信用卡业务管理不到位，被青海金融监管局罚款55万元。', source: '青海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: JSON.stringify(['处罚', '信用卡业务']), publish_date: '2026-03-20'},

    // ========== 商机信息 ==========
    // 前端分类用的是 'business'
    {title: '场景金融：信用卡业务从"发卡"转向"场景获客"', summary: '随着信用卡新规实施，银行信用卡业务正从传统的跑马圈地转向场景化、精细化运营。场景金融成为信用卡获客和活客的核心抓手，包括线下商超、餐饮、文旅、出行等高频消费场景。', source: '行业研究', url: 'https://credit-news-platform-production-6acb.up.railway.app/', category: 'business', tags: JSON.stringify(['商机', '场景金融', '获客']), publish_date: '2026-04-01'},
    {title: '数字化创新：AI+大数据赋能信用卡风控与营销', summary: '信用卡行业数字化转型加速，AI大模型、大数据风控、智能营销成为竞争焦点。银行加大对信用卡数字化渠道的投入，通过精准营销提升获客效率。', source: '行业研究', url: 'https://credit-news-platform-production-6acb.up.railway.app/', category: 'business', tags: JSON.stringify(['商机', '数字化', 'AI', '风控']), publish_date: '2026-04-01'},
    {title: '不良资产处置：信用卡不良资产批量转让市场升温', summary: '随着信用卡不良率攀升，银行加速通过批量转让方式出清信用卡不良资产。2026年1月，个人不良贷款批量转让市场持续升温，信用卡不良资产转让成为银行出清风险的常规渠道。', source: '银登中心', url: 'https://www.nfra.gov.cn/', category: 'business', tags: JSON.stringify(['商机', '不良资产', '批量转让']), publish_date: '2026-04-01'},

    // ========== 投标信息 (bid) - 2026年最新招标 ==========
    {title: '光大银行成都分行2026年4-12月信用卡场景流量获客项目', summary: '中国光大银行股份有限公司成都分行招标采购2026年4-12月信用卡场景流量获客服务，包括线下获客及活客活动、满减活动、分期营销活动等。', source: '四川东升项目管理', url: 'http://www.scdsxg.com/cms/news/1214.html', category: 'bid', tags: JSON.stringify(['投标', '光大银行', '场景获客']), publish_date: '2026-03-18'},
    {title: '工商银行2026至2028年信用卡分期付款外呼项目', summary: '中国工商银行招标采购2026至2028年信用卡分期付款外呼服务，入围4家供应商，初始人员规模合计1100人。', source: '中信国际招标', url: 'https://www.bbda.com/bidDetail/0081fd592cd93bb6567cd7f303a4bab4ea86d46194a6d2d4d856ec9f2753a115.html', category: 'bid', tags: JSON.stringify(['投标', '工商银行', '分期业务']), publish_date: '2025-11-18'},
    {title: '中信银行信用卡中心2026-2028年度前期电话催收业务外包项目', summary: '中信银行股份有限公司信用卡中心招标采购2026-2028年度前期电话催收业务外包服务。', source: '中信银行信用卡中心', url: 'https://www.bbda.com/bidDetail/4aaf8cca31bdd7890043fd5806ad8d3d24fe72083f46d47adaf721b7642d4016.html', category: 'bid', tags: JSON.stringify(['投标', '中信银行', '催收外包']), publish_date: '2025-11-21'},
    {title: '邮储银行北京分行2026年信用卡业务营销活动服务采购项目', summary: '中国邮政储蓄银行股份有限公司北京分行采购两家信用卡业务营销服务商，配合开展2026年信用卡业务营销活动。', source: '中国邮政集团', url: 'https://www.chinapost.com.cn/html1/report/2603/3199-1.htm', category: 'bid', tags: JSON.stringify(['投标', '邮储银行', '营销活动']), publish_date: '2026-03-09'},
    {title: '建设银行山东省分行2026年信用卡消费促销系列活动服务采购项目', summary: '中国建设银行股份有限公司山东省分行通过公开招标方式选取信用卡消费促销系列活动服务商，采购价格有效期1年。', source: '山东省鲁成招标', url: 'https://www.bbda.com/bidDetail/5864d5e3702b5a2aa8a4c5eab4767be74ee653b181edfde5d079a98b5083c293.html', category: 'bid', tags: JSON.stringify(['投标', '建设银行', '消费促销']), publish_date: '2025-12-18'},
    {title: '光大银行武汉分行2026年上半年信用卡数字化渠道获客业务采购项目', summary: '中国光大银行股份有限公司武汉分行采购2026年上半年信用卡数字化渠道获客服务，中标供应商为中盛供应链（深圳）有限公司，高端卡370元/户��中��卡195元/户。', source: '湖北省招标股份有限公司', url: 'https://www.hbbidding.com.cn/view/22778.html', category: 'bid', tags: JSON.stringify(['投标', '光大银行', '数字化获客']), publish_date: '2025-12-24'},
    {title: '2026年建行银联信用卡分行特惠场景活动宣传服务商采购', summary: '中国银联采购1家服务商，为建行银联信用卡分行特惠场景活动提供全周期统筹落地与全方位宣传推广服务。', source: '中国银联', url: 'https://zaoyangshi.jrzb.com/purchases/2026-04-11.3d43cb0838050ca6450f37ca64fc560b', category: 'bid', tags: JSON.stringify(['投标', '中国银联', '建行', '场景营销']), publish_date: '2026-04-11'},
    {title: '江苏省联社新核心业务系统项目测试服务招标公告', summary: '江苏省农村信用社联合社新核心业务系统项目测试服务招标，甲方资质要求包括资产规模超过1万亿元的城商行：杭州银行、宁波银行、长沙银行、重庆农村商业银行等。', source: 'js96008.com', url: 'http://www.js96008.com/cn/khfw/zxgg/2893.html', category: 'bid', tags: JSON.stringify(['投标', '省联社', '测试服务']), publish_date: '2026-04-09'},
    {title: '广东南粤银行2026-2027年通用数据开发服务项目', summary: '广东南粤银行2026-2027年通用数据开发服务项目招标，要求与城商行、农商行总行合作的数据开发类案例。', source: 'gdnybank.com', url: 'https://www.gdnybank.com/nygg/20260401/38232.html', category: 'bid', tags: JSON.stringify(['城商行', '招标']), publish_date: '2026-04-01'},
    {title: '广州银行银行卡卡片制作及个人化外包服务采购项目', summary: '广州银行银行卡卡片制作及个人化外包服务采购项目招标公告。', source: '广州银行', url: 'https://www.gzbank.com.cn/', category: 'bid', tags: JSON.stringify(['城商行', '卡片制作']), publish_date: '2026-03-30'},
    {title: '中国建设银行四川省分行2026年信用卡逾期欠款委外催收外包项目', summary: '中国建设银行四川省分行2026年信用卡逾期欠款委外催收外包项目招标公告。', source: '建设银行四川分行', url: 'https://www.ccb.com/scn/', category: 'bid', tags: JSON.stringify(['投标', '建设银行', '催收']), publish_date: '2026-03-25'},
    {title: '湖南银行2026年信用卡线上营销活动项目', summary: '湖南银行2026年信用卡线上营销活动项目招标。', source: '湖南银行', url: 'https://www.hunanbank.com.cn/', category: 'bid', tags: JSON.stringify(['投标', '湖南银行', '营销']), publish_date: '2026-04-07'}
];

// 旧数据（保留一些经典示例）
const legacyData = [
    {title: '2025年9月信用卡新规-债务法律', summary: '信用卡发卡机构需根据客户的还款记录、消费行为和信用评价动态调整额度，杜绝盲目提升额度导致的风险。', source: 'news.online.sh.cn', url: 'https://news.online.sh.cn/rxinfo/zwfl/222070.html', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2025-08-18'},
    {title: '信用卡新规：资金用途受限，违规惩罚更严厉！', summary: '多家银行已明确信用卡资金的用途限制，并对违规行为进行了严格管控。', source: 'weixin', url: 'http://mp.weixin.qq.com/s?__biz=MzkzMTUxNTM5OA==&mid=2247484762&idx=1&sn=a602236f3814345e25c14be6b3e74db6', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2025-03-19'},
    {title: '信用卡逾期管理新规解读', summary: '新规需求银行建立健全信用卡逾期风险机制，包含风险监测、预警、处置等环节。', source: 'chinaemail.com.cn', url: 'http://www.chinaemail.com.cn/news/zixun/2657375.html', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2024-10-16'},
    {title: '北京银行信用卡核心系统升级项目', summary: '北京银行信用卡核心系统升级项目，采购信用卡发卡、授权、清算等核心功能模块。', source: 'bankofbeijing.com.cn', url: 'https://www.bankofbeijing.com.cn/creditcard/bid/2026/0312.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '核心系统']), publish_date: '2026-03-12'},
    {title: '江苏银行信用卡营销获客系统采购项目', summary: '江苏银行信用卡营销获客系统采购项目，包含线上渠道获客、精准营销、客户画像等功能。', source: 'jsbchina.cn', url: 'https://www.jsbchina.cn/cn/bid/2026/0115.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '营销系统']), publish_date: '2026-01-15'},
    {title: '杭州银行信用卡APP开发项目', summary: '杭州银行信用卡APP开发项目，包含iOS和Android双端开发。', source: 'hzbank.com.cn', url: 'https://www.hzbank.com.cn/bid/2026/0301.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', 'APP开发']), publish_date: '2026-03-01'},
    {title: '广东省农村信用社联合社信用卡系统建设项目', summary: '广东省农村信用社联合社信用卡系统建设项目，为辖内农商行提供信用卡发卡、交易处理、清算等服务。', source: 'gdrcu.com', url: 'https://www.gdrcu.com/bid/2026/0228.html', category: 'bid', tags: JSON.stringify(['招标', '省联社', '信用卡', '核心系统']), publish_date: '2026-02-28'}
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

                let inserted = 0;
                let skipped = 0;
                const allData = [...initialData, ...legacyData];
                const total = allData.length;

                allData.forEach(article => {
                    // 先删除旧的industry/opportunity数据，再插入新的
                    db.run(
                        `DELETE FROM articles WHERE category IN ('industry', 'opportunity')`,
                        [],
                        function(err) {
                            if (err) console.error('Delete error:', err);
                        }
                    );
                    db.run(
                        `INSERT OR REPLACE INTO articles (title, summary, source, url, category, tags, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [article.title, article.summary, article.source, article.url + '?t=' + Date.now(), article.category, article.tags, article.publish_date],
                        function(err) {
                            if (err) {
                                console.error('Insert error:', err);
                            } else if (this.changes > 0) {
                                inserted++;
                            } else {
                                skipped++;
                            }

                            if (inserted + skipped === total) {
                                console.log(`✅ 数据初始化完成: 新增 ${inserted} 条, 跳过 ${skipped} 条`);
                                console.log(`📊 数据分类:`);
                                db.all(`SELECT category, COUNT(*) as count FROM articles GROUP BY category`, [], (err, rows) => {
                                    rows.forEach(row => {
                                        console.log(`   - ${row.category}: ${row.count} 条`);
                                    });
                                    db.close();
                                    resolve({ inserted, skipped });
                                });
                            }
                        }
                    );
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