// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 2026年1-4月最新数据 - 包含智能营销、小额贷款、催收、支付、客服、双录、质检
const initialData = [
    // ========== 监管政策 (policy) ==========
    {title: '三部门：个人消费贷款贴息政策延至2026年底，信用卡账单分期纳入支持范围', summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年12月31日，首次将信用卡账单分期业务纳入贴息支持范围，年贴息比例为1个百分点。取消单笔消费贴息500元上限，每名借款人每年累计贴息上限维持3000元，新增500多家经办机构。', source: '财政部/央行/金融监管总局', url: 'https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1243763', category: 'policy', tags: '["政策","消费贷款"]', publish_date: '2026-01-20'},
    {title: '《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施', summary: '2026年1月1日起，中国人民银行、国家金融监督管理总局、证监会三部门联合发布的《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施。将过去的"客户身份识别"升级为"客户尽职调查"，要求银行从静态的"核对身份证"转变为动态的"了解你的客户"，必须穿透识别受益所有人，并持续监测交易行为。', source: '央行/金融监管总局/证监会', url: 'https://www.pbc.gov.cn/', category: 'policy', tags: '["政策","反洗钱"]', publish_date: '2026-01-01'},

    // ========== 行业资讯 (news) ==========
    {title: '年内超45款信用卡被停发！信用卡发卡量三年锐减1.11亿张', summary: '2026年开年以来，农业银行、民生银行、交通银行、广发银行等多家银行密集发布公告，宣布停止发行多款信用卡产品。民生银行一次性叫停11款联名信用卡产品，农业银行先后停发饿了么联名卡等13款产品及大学生青春卡等多款卡种。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: '["行业","停发潮"]', publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着2024年7月信用卡新规全面实施，银行业从过去的跑马圈地增量竞赛正式转入存量博弈时代。2025年已有66家信用卡分中心关停，多家银行相继关停独立信用卡App。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: '["行业","存量经营"]', publish_date: '2026-04-19'},

    // ========== 处罚数据 (risk) ==========
    {title: '建设银行信用卡中心被罚575.27万元', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.27万元。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡中心"]', publish_date: '2026-03-23'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元', summary: '2026年一季度，中国人民银行、国家金融监督管理总局及各分局共开出处罚记录625条，罚单金额总计5.76亿元，涉及银行机构至少586家。信贷违规仍是"重灾区"，信用卡业务违规问题较为突出。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: '["处罚","监管"]', publish_date: '2026-04-01'},

    // ========== 投标信息 (bid) - 2026年1-4月最新 ==========
    // 智能营销
    {title: '工行江苏省分行2026年AI数字客户经理营销触客项目', summary: '预算300万元，有效期两年，AI数字人协助在外部流量平台开展对客营销', source: '智探AI应用', url: 'https://www.gm7.org/archives/55512', category: 'bid', tags: '["智能营销","AI"]', publish_date: '2026-03-18'},
    {title: '邮储银行北京分行智能营销终端采购项目', summary: '采购100台智能营销终端，用于关键岗位员工', source: '中国邮政', url: 'https://www.chinapost.com.cn/html1/report/2603/4510-1.htm', category: 'bid', tags: '["智能营销","设备"]', publish_date: '2026-03-11'},
    {title: '邮储银行山东省分行大众客户直营智能辅助服务', summary: '预算220万元两年，服务包括智能机器人外呼线路、营销场景策划、人机协呼功能', source: '中国邮政', url: 'https://www.chinapost.com.cn/xhtml1/report/2602/5849-1.htm', category: 'bid', tags: '["智能外呼","智能营销"]', publish_date: '2026-02-10'},
    
    // 小额贷款/催收
    {title: '湖南银行普惠数字化逾期贷款催收项目', summary: '预算1700万元，数字化逾期贷款催收服务', source: '湖南银行', url: 'https://www.hunan-bank.com/96599/2026-04/02/article_2026040216452038885.shtml', category: 'bid', tags: '["催收","数字化"]', publish_date: '2026-04-02'},
    {title: '邮储银行广西区分行个人逾期贷款委外催收服务', summary: '预算1129万元，小额贷款629万+消费贷款500万', source: '中国邮政', url: 'https://www.chinapost.com.cn/html1/report/25051/1431-1.htm', category: 'bid', tags: '["催收","小额贷款"]', publish_date: '2026-01-01'},
    
    // 智能客服/文本机器人
    {title: '浙江农商联合银行新一代智能文本客服机器人系统', summary: '科大讯飞中标，提升银行智能客服能力', source: '智探AI应用', url: 'https://www.gm7.org/archives/49831', category: 'bid', tags: '["智能客服","文本机器人"]', publish_date: '2026-03-09'},
    {title: '中国银行四川省分行AI智能外呼营销项目', summary: '采购AI智能外呼营销服务', source: '移动支付网', url: 'https://m.mpaypass.com.cn/news/202602/10104852.html', category: 'bid', tags: '["AI外呼","智能营销"]', publish_date: '2026-02-10'},
    {title: '河北农信第二代客服智能服务系统项目', summary: '预算430万元，科大讯飞中标，智能语音导航、智能文本机器人、数字人客服、智能外呼、智能质检', source: '智探AI应用', url: 'http://mp.weixin.qq.com/s?__biz=MzA5MzMwNTIzMw==', category: 'bid', tags: '["智能客服","智能质检"]', publish_date: '2025-07-01'},
    
    // 双录/智能质检
    {title: '宁波银行智能双录系统XC改造测试项目', summary: '包含柜面双录、远程双录、自助双录三个渠道录制功能及互联网质检平台', source: '宁波银行', url: 'https://meks.jrzb.com/purchases/2026-03-11.aabf7aa40eaff0260854476cfdb55a0a', category: 'bid', tags: '["双录","智能质检"]', publish_date: '2026-03-11'},
    {title: '河南农商银行信贷AI智能双录系统项目', summary: '预算660万元，信贷AI智能双录系统建设和全行级音视频中台部署', source: '智探AI应用', url: 'http://mp.weixin.qq.com/s?__biz=MzU3ODE2MTk2Mg==', category: 'bid', tags: '["双录","AI质检"]', publish_date: '2025-08-05'},
    {title: '光大证券临柜智能双录2025优化项目', summary: '中标金额335万元，顶点软件中标', source: '光大证券', url: 'https://finance.sina.com.cn/stock/aigc/zab/2026-01-27', category: 'bid', tags: '["双录","信创"]', publish_date: '2026-01-22'},
    
    // 大模型/支付
    {title: '广西北部湾银行DeepSeek大模型一体机项目', summary: '预算358万元，润建股份中标', source: '智探AI应用', url: 'http://mp.weixin.qq.com/s?__biz=MzIxMDIwODM2MA==', category: 'bid', tags: '["大模型","智能营销"]', publish_date: '2025-07-03'},
    
    // 原有投标数据保留 - 修正URL
    {title: '2026年建行银联信用卡分行特惠场景活动宣传服务商采购', summary: '中国银联采购1家服务商，为建行银联信用卡分行特惠场景活动提供全周期统筹落地与全方位宣传推广服务', source: '中国银联', url: 'https://zaoyangshi.jrzb.com/purchases/2026-04-11.3d43cb0838050ca6450f37ca64fc560b', category: 'bid', tags: '["投标","中国银联"]', publish_date: '2026-04-11'},
    {title: '江苏省联社新核心业务系统项目测试服务招标公告', summary: '江苏省农村信用社联合社新核心业务系统项目测试服务招标', source: 'js96008.com', url: 'http://www.js96008.com/cn/khfw/zxgg/2893.html', category: 'bid', tags: '["投标","省联社"]', publish_date: '2026-04-09'},
    {title: '湖南银行2026年信用卡线上营销活动项目', summary: '湖南银行2026年信用卡线上营销活动项目招标', source: '湖南银行', url: 'https://www.hunanbank.com.cn/', category: 'bid', tags: '["投标","湖南银行"]', publish_date: '2026-04-07'},
    
    // 修正URL的问题数据
    {title: '湖南省农村信用社联合社2025年基础软硬件维保采购项目', summary: '预算74万元，NBU备份软件原厂维保57万+金蝶天燕WEB中间件及达梦数据库维保17万', source: '湖南省农村信用社', url: 'https://www.hnnxs.com/info/87595.jspx', category: 'bid', tags: '["维保","省联社"]', publish_date: '2026-04-03'},
    {title: '广州农村商业银行2026-2027年信用卡中心服务外包项目', summary: '预算804万元，采购828人月外包服务，涵盖客户服务、催收、营销', source: '广州农商行', url: 'https://www.grcbank.com/grcbank/gywx/cggg/2026032416151748215/index.shtml', category: 'bid', tags: '["外包","农商行"]', publish_date: '2026-03-24'},
    
    // 四川银行招标 - 2026年4月新增
    {title: '四川银行双录服务系统2025年度升级项目', summary: '预算138万元，广州佰锐网络科技有限公司中标130万元', source: '四川银行', url: 'https://www.scbank.cn/cn/col322/6510307.html', category: 'bid', tags: '["双录","四川银行"]', publish_date: '2026-04-15'},
    {title: '四川银行2026年数据中心基础软硬件采购项目(数据中心基础通信设备)', summary: '预算7519.76万元，含交换机、路由器、防火墙等', source: '国信招标', url: 'http://www.qgzbcgjypt.com/gongchengzhaobiao/67394.html', category: 'bid', tags: '["设备采购","四川银行"]', publish_date: '2026-03-14'},
    {title: '四川银行2026年数据中心基础软硬件采购项目(C86服务器)', summary: '预算7580.18万元，采购C86服务器设备', source: '国信招标', url: 'http://www.qgzbcgjypt.com/xinwenzhongxin/67461.html', category: 'bid', tags: '["服务器","四川银行"]', publish_date: '2026-03-14'},
    {title: '四川银行2026年2-4季度特色工程满减及券码活动采购项目', summary: '预算2276.21万元，八项工程满减及券码活动', source: '国信招标', url: 'http://www.qgzbcgjypt.com/gonggaogongshi/69958.html', category: 'bid', tags: '["营销活动","四川银行"]', publish_date: '2026-03-20'},
    {title: '四川银行2026年电子Ⅱ类户营销活动权益采购项目（第二批）', summary: '预算4101万元，权益发放服务采购', source: '四川银行', url: 'https://www.scbank.cn/cn/col322/6491225.html', category: 'bid', tags: '["权益营销","四川银行"]', publish_date: '2026-04-17'},
    {title: '四川银行2026年测试技术服务框架采购项目', summary: '预算1460万元，测试技术服务框架采购', source: '移动支付网', url: 'https://www.mpaypass.com.cn/news/202601/26105144.html', category: 'bid', tags: '["测试服务","四川银行"]', publish_date: '2026-01-26'},
    
    // 其他银行招标 - 2026年新增
    {title: '兴业银行呼叫中心自助语音交互信创建设项目', summary: '中电金信软件有限公司中标，呼叫中心自助语音交互信创建设', source: '兴业银行', url: 'https://cg.cib.com.cn/cms/default/webfile/ywgg3/20260402/1224297819502804992.html', category: 'bid', tags: '["智能客服","兴业银行"]', publish_date: '2026-04-02'},
    {title: '中信银行CANN生态信创大模型服务器入围采购项目', summary: '预算1658万元，神州鲲泰中标968万元，基于昇腾芯片', source: 'CSDN', url: 'https://gitcode.csdn.net/69db476b0a2f6a37c59efc9e.html', category: 'bid', tags: '["大模型","中信银行"]', publish_date: '2026-04-03'},
    {title: '中国进出口银行AI大模型一体机采购项目', summary: '预算968万元，讯飞智元中标，用于构建AI算力底座', source: 'CSDN', url: 'https://gitcode.csdn.net/69db476b0a2f6a37c59efc9e.html', category: 'bid', tags: '["大模型","进出口银行"]', publish_date: '2026-03-01'},
    {title: '天津银行智能客服平台数字人及智能Siri功能项目', summary: '预算121.5万元，在线客服增加数字人及智能Siri功能', source: '国信采招', url: 'http://gxzzzb.top/?m=home&c=View&a=index&aid=2400', category: 'bid', tags: '["智能客服","数字人","天津银行"]', publish_date: '2026-01-08'},
    {title: '光大银行智能运营中心大模型GPU算力资源采购项目', summary: '预算3000万元，采购10台大模型算力服务器', source: '移动支付网', url: 'https://m.mpaypass.com.cn/news/202601/15102031.html', category: 'bid', tags: '["算力","光大银行"]', publish_date: '2025-09-01'},
    {title: '浦发银行DeepSeek-R1671B千亿级大模型部署', summary: '计划投入约15亿元用于大模型相关技术研发和应用落地', source: 'CSDN', url: 'http://mp.weixin.qq.com/s?__biz=MjM5Njk3MDM0Mg==', category: 'bid', tags: '["大模型","浦发银行"]', publish_date: '2025-02-01'}
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
                    
                    initialData.forEach(item => {
                        stmt.run(item.title, item.summary, item.source, item.url, item.category, item.tags, item.publish_date, function(err) {
                            if (err) console.error('Insert error:', err);
                            inserted++;
                            if (inserted === initialData.length) {
                                stmt.finalize();
                                db.close();
                                console.log(`✅ 共插入 ${inserted} 条数据`);
                                resolve();
                            }
                        });
                    });
                });
            });
        });
    });
}

module.exports = { initData };