// 初始化数据脚本 - 用于 Railway 首次部署时填充示例数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

const initialData = [
    // 监管政策
    {title: '六大行迅速发布信用卡分期贴息"指南"', summary: '1月20日，财政部、中国人民银行、国家金融监督管理总局发布《关于优化实施个人消费贷款财政贴息政策有关事项的通知》', source: 'jr.jl.gov.cn', url: 'https://jr.jl.gov.cn/jrzx/zyjrxxzz/gj/202601/t20260130_3551000.html', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2026-01-30'},
    {title: '要求金融机构发展消费金融 监管部门再发文鼓励"线上开卡"', summary: '国家金融监督管理总局近期发布通知，要求金融机构发展消费金融，助力提振消费。通知提到，在有效核实身份、风险可控的前提下，探索开展线上开立和激活信用卡业务。', source: 'finance.sina.cn', url: 'https://finance.sina.cn/2025-03-27/detail-ineqznmc8553648.d.html', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2025-03-27'},
    {title: '国家金融监督管理总局北京监管局消费者风险提示：这份信用卡注销业务提示请您收好', summary: '近期，有消费者反映信用卡注销业务流程不顺畅。为切实维护金融消费者合法权益，引导消费者规范办理信用卡注销业务', source: 'ccb.com', url: 'https://www1.ccb.com/chn/2026-03/16/article_2026031615442923038.shtml', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2026-03-16'},
    {title: '港澳银行内地分行开办银行卡业务有关事项的通知', summary: '国家金融监督管理总局关于港澳银行内地分行开办银行卡业务有关事项的通知，2025年3月1日生效', source: '055110.com', url: 'https://m.055110.com/law/1/42467.html', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2025-02-20'},
    {title: '3月信用卡相关监管政策一览', summary: '《国家金融监督管理总局关于发展消费金融助力提振消费的通知》印发，增加消费金融供给', source: 'sohu.com', url: 'https://www.sohu.com/a/878892714_659885', category: 'policy', tags: JSON.stringify(['监管', '政策']), publish_date: '2025-04-02'},
    
    // 风险新规
    {title: '2025年9月信用卡新规-债务法律', summary: '信用卡发卡机构需根据客户的还款记录、消费行为和信用评价动态调整额度，杜绝盲目提升额度导致的风险。', source: 'news.online.sh.cn', url: 'https://news.online.sh.cn/rxinfo/zwfl/222070.html', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2025-08-18'},
    {title: '信用卡逾期管理新规解读：如何有效控制风险与维护用户权益？', summary: '新规需求银行建立健全信用卡逾期风险机制，包含风险监测、预警、处置等环节。', source: 'chinaemail.com.cn', url: 'http://www.chinaemail.com.cn/news/zixun/2657375.html', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2024-10-16'},
    {title: '信用卡新规：资金用途受限，违规惩罚更严厉！', summary: '多家银行已明确信用卡资金的用途限制，并对违规行为进行了严格管控。', source: 'weixin', url: 'http://mp.weixin.qq.com/s?__biz=MzkzMTUxNTM5OA==&mid=2247484762&idx=1&sn=a602236f3814345e25c14be6b3e74db6', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2025-03-19'},
    {title: '信用卡新规全面实施', summary: '2022年7月7日起，中国人民银行联合发布的信用卡新规全面实施，旨在规范信用卡业务，加强风险管控', source: 'pdsxww.com', url: 'http://epaper.pdsxww.com/pdswb/page/41/2024-07/11/A07/20240711A07_pdf.pdf', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2024-07-11'},
    {title: '区域性银行信用卡数字化转型研究报告', summary: '监管机构对于银行业金融机构信用卡业务风险监控不断加强，陆续出台多项政策', source: 'fddnet.cn', url: 'https://www.fddnet.cn/wendang/xyksz.pdf', category: 'risk', tags: JSON.stringify(['风险', '新规']), publish_date: '2024-01-01'},
    
    // 招标信息 - 全国性银行（示例）
    {title: '中信银行信用卡中心电话销售业务外包采购项目招标公告', summary: '中信银行信用卡中心电话销售业务外包采购项目，招标文件发售时间：2026年3月12日起至2026年3月18日', source: 'citic.com', url: 'https://ebuy.citic.com/cms/default/webfile/1ywgg2/20260311/1216482580698759168.html', category: 'bid', tags: JSON.stringify(['招标', '采购', '信用卡', '电销外包']), publish_date: '2026-03-11'},
    {title: '中国邮政储蓄银行信用卡中心2025-2027年信用卡用卡保障权益服务采购项目', summary: '中国邮政储蓄银行信用卡中心2025-2027年信用卡用卡保障权益服务采购项目公开招标', source: 'chinapost.com.cn', url: 'https://www.chinapost.com.cn/html1/report/2511/4263-1.htm', category: 'bid', tags: JSON.stringify(['招标', '采购', '信用卡', '权益平台']), publish_date: '2025-11-12'},
    
    // 招标信息 - 城商行
    {title: '成都银行2025年信用卡系统租赁年度供应商采购项目', summary: '成都银行2025年信用卡系统租赁年度供应商采购项目，预算金额：1,730,000元', source: 'bocd.com.cn', url: 'https://pcms.bocd.com.cn/cms/cmscaigougg/3467a9dd597742fbb2efb0e1a17c0b4b.html', category: 'bid', tags: JSON.stringify(['招标', '采购', '城商行', '信用卡', '核心系统']), publish_date: '2025-09-22'},
    {title: '北京银行信用卡核心系统升级项目招标公告', summary: '北京银行信用卡核心系统升级项目，采购信用卡发卡、授权、清算等核心功能模块', source: 'bankofbeijing.com.cn', url: 'https://www.bankofbeijing.com.cn/creditcard/bid/2026/0312.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '核心系统', '升级改造']), publish_date: '2026-03-12'},
    {title: '上海银行信用卡风控系统建设项目', summary: '上海银行信用卡风控系统建设项目，包含申请反欺诈、交易监控、信用评分等模块', source: 'bankofshanghai.com', url: 'https://www.bankofshanghai.com/bid/2026/0208.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '风控系统', '反欺诈']), publish_date: '2026-02-08'},
    {title: '江苏银行信用卡营销获客系统采购项目', summary: '江苏银行信用卡营销获客系统采购项目，包含线上渠道获客、精准营销、客户画像等功能', source: 'jsbchina.cn', url: 'https://www.jsbchina.cn/cn/bid/2026/0115.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '营销系统', '获客系统']), publish_date: '2026-01-15'},
    {title: '南京银行信用卡催收外包服务项目', summary: '南京银行信用卡催收外包服务项目，委托第三方机构进行信用卡逾期账款催收', source: 'njcb.com.cn', url: 'https://www.njcb.com.cn/bid/2025/1120.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '催收系统', '外包服务']), publish_date: '2025-11-20'},
    {title: '杭州银行信用卡APP开发项目', summary: '杭州银行信用卡APP开发项目，包含iOS和Android双端开发，支持账单查询、分期申请、积分兑换等功能', source: 'hzbank.com.cn', url: 'https://www.hzbank.com.cn/bid/2026/0301.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '移动端', 'APP开发']), publish_date: '2026-03-01'},
    {title: '宁波银行信用卡积分权益平台建设项目', summary: '宁波银行信用卡积分权益平台建设项目，包含积分商城、权益兑换、合作商户接入等功能', source: 'nbcb.com.cn', url: 'https://www.nbcb.com.cn/bid/2025/1225.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '积分系统', '权益平台']), publish_date: '2025-12-25'},
    {title: '长沙银行信用卡审批系统升级项目', summary: '长沙银行信用卡审批系统升级项目，包含自动化审批、额度管理、征信对接等功能', source: 'cscb.cn', url: 'https://www.cscb.cn/bid/2026/0218.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '审批系统', '征信系统']), publish_date: '2026-02-18'},
    {title: '重庆银行信用卡客服呼叫中心外包项目', summary: '重庆银行信用卡客服呼叫中心外包项目，提供7x24小时客户服务、投诉处理、业务咨询等', source: 'cqcbank.com', url: 'https://www.cqcbank.com/bid/2025/1030.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '客服系统', '外包服务']), publish_date: '2025-10-30'},
    {title: '青岛银行信用卡数据平台建设项目', summary: '青岛银行信用卡数据平台建设项目，包含数据仓库、数据分析、报表系统、监管报送等功能', source: 'qdccb.com', url: 'https://www.qdccb.com/bid/2026/0108.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '数据系统']), publish_date: '2026-01-08'},
    {title: '厦门银行信用卡支付系统改造项目', summary: '厦门银行信用卡支付系统改造项目，包含银联支付、第三方支付、快捷支付等渠道升级', source: 'xmbankonline.com', url: 'https://www.xmbankonline.com/bid/2025/1212.html', category: 'bid', tags: JSON.stringify(['招标', '城商行', '信用卡', '支付系统', '升级改造']), publish_date: '2025-12-12'},
    
    // 招标信息 - 农商行
    {title: '上海农商银行信用卡发卡系统建设项目', summary: '上海农商银行信用卡发卡系统建设项目，包含信用卡申请、审批、发卡、激活等全流程功能', source: 'shrcb.com', url: 'https://www.shrcb.com/bid/2026/0320.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '核心系统', '发卡系统']), publish_date: '2026-03-20'},
    {title: '北京农商银行信用卡风控反欺诈系统采购', summary: '北京农商银行信用卡风控反欺诈系统采购项目，包含实时交易监控、风险预警、欺诈识别等功能', source: 'bjrcb.com', url: 'https://www.bjrcb.com/bid/2026/0118.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '风控系统', '反欺诈系统']), publish_date: '2026-01-18'},
    {title: '广州农商银行信用卡营销系统升级项目', summary: '广州农商银行信用卡营销系统升级项目，包含客户分层、精准营销、活动管理等功能', source: 'grcbank.com', url: 'https://www.grcbank.com/bid/2025/1128.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '营销系统', '升级改造']), publish_date: '2025-11-28'},
    {title: '深圳农商银行信用卡催收管理系统', summary: '深圳农商银行信用卡催收管理系统建设项目，包含催收策略、外呼管理、法务催收等模块', source: 'szrcb.com', url: 'https://www.szrcb.com/bid/2026/0205.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '催收系统']), publish_date: '2026-02-05'},
    {title: '成都农商银行信用卡账单系统开发项目', summary: '成都农商银行信用卡账单系统开发项目，包含账单生成、账单查询、分期账单等功能', source: 'cdrcb.com', url: 'https://www.cdrcb.com/bid/2025/1220.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '账单系统']), publish_date: '2025-12-20'},
    {title: '天津农商银行信用卡客服系统外包项目', summary: '天津农商银行信用卡客服系统外包项目，提供信用卡业务咨询、投诉处理、挂失等服务', source: 'tjbhb.com', url: 'https://www.tjbhb.com/bid/2026/0315.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '客服系统', '外包服务']), publish_date: '2026-03-15'},
    {title: '武汉农商银行信用卡分期系统建设项目', summary: '武汉农商银行信用卡分期系统建设项目，包含账单分期、现金分期、商户分期等功能', source: 'whrcbank.com', url: 'https://www.whrcbank.com/bid/2025/1108.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '分期系统']), publish_date: '2025-11-08'},
    {title: '苏州农商银行信用卡权益平台采购项目', summary: '苏州农商银行信用卡权益平台采购项目，包含机场贵宾、道路救援、保险服务等权益', source: 'szrcb.com.cn', url: 'https://www.szrcb.com.cn/bid/2026/0125.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '权益平台']), publish_date: '2026-01-25'},
    {title: '杭州联合银行信用卡审批系统建设项目', summary: '杭州联合银行信用卡审批系统建设项目，包含自动审批、人工复核、额度测算等功能', source: 'urcb.com', url: 'https://www.urcb.com/bid/2025/1218.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '审批系统']), publish_date: '2025-12-18'},
    {title: '东莞农商银行信用卡积分系统升级项目', summary: '东莞农商银行信用卡积分系统升级项目，包含积分累计、积分兑换、积分商城等功能', source: 'drcbank.com', url: 'https://www.drcbank.com/bid/2026/0308.html', category: 'bid', tags: JSON.stringify(['招标', '农商行', '信用卡', '积分系统', '升级改造']), publish_date: '2026-03-08'},
    
    // 招标信息 - 省联社
    {title: '广东省农村信用社联合社信用卡系统建设项目', summary: '广东省农村信用社联合社信用卡系统建设项目，为辖内农商行提供信用卡发卡、交易处理、清算等服务', source: 'gdrcu.com', url: 'https://www.gdrcu.com/bid/2026/0228.html', category: 'bid', tags: JSON.stringify(['招标', '省联社', '信用卡', '核心系统']), publish_date: '2026-02-28'},
    {title: '江苏省农村信用社联合社信用卡风控系统采购', summary: '江苏省农村信用社联合社信用卡风控系统采购项目，包含申请评分、行为评分、反欺诈等模块', source: 'jsrcu.com', url: 'https://www.jsrcu.com/bid/2025/1105.html', category: 'bid', tags: JSON.stringify(['招标', '省联社', '信用卡', '风控系统']), publish_date: '2025-11-05'},
    {title: '浙江省农村信用社联合社信用卡营销平台建设项目', summary: '浙江省农村信用社联合社信用卡营销平台建设项目，包含客户管理、营销活动、渠道协同等功能', source: 'zj96596.com', url: 'https://www.zj96596.com/bid/2026/0110.html', category: 'bid', tags: JSON.stringify(['招标', '省联社', '信用卡', '营销系统']), publish_date: '2026-01-10'},
    {title: '山东省农村信用社联合社信用卡数据系统升级', summary: '山东省农村信用社联合社信用卡数据系统升级项目，包含数据仓库、数据治理、监管报送等功能', source: 'sdrcu.com', url: 'https://www.sdrcu.com/bid/2025/1228.html', category: 'bid', tags: JSON.stringify(['招标', '省联社', '信用卡', '数据系统', '升级改造']), publish_date: '2025-12-28'},
    {title: '四川省农村信用社联合社信用卡核心系统维护项目', summary: '四川省农村信用社联合社信用卡核心系统维护项目，包含系统运维、故障处理、版本升级等服务', source: 'scrcu.com.cn', url: 'https://www.scrcu.com.cn/bid/2026/0325.html', category: 'bid', tags: JSON.stringify(['招标', '省联社', '信用卡', '核心系统', '运维服务']), publish_date: '2026-03-25'}
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

                initialData.forEach(article => {
                    db.run(
                        `INSERT OR IGNORE INTO articles (title, summary, source, url, category, tags, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [article.title, article.summary, article.source, article.url, article.category, article.tags, article.publish_date],
                        function(err) {
                            if (err) {
                                console.error('Insert error:', err);
                            } else if (this.changes > 0) {
                                inserted++;
                            } else {
                                skipped++;
                            }

                            if (inserted + skipped === initialData.length) {
                                console.log(`✅ 数据初始化完成: 新增 ${inserted} 条, 跳过 ${skipped} 条`);
                                db.close();
                                resolve({ inserted, skipped });
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