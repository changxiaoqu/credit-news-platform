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
    
    // 招标信息
    {title: '中信银行信用卡中心电话销售业务外包采购项目招标公告', summary: '中信银行信用卡中心电话销售业务外包采购项目，招标文件发售时间：2026年3月12日起至2026年3月18日', source: 'citic.com', url: 'https://ebuy.citic.com/cms/default/webfile/1ywgg2/20260311/1216482580698759168.html', category: 'bid', tags: JSON.stringify(['招标', '采购']), publish_date: '2026-03-11'},
    {title: '成都银行2025年信用卡系统租赁年度供应商采购项目', summary: '成都银行2025年信用卡系统租赁年度供应商采购项目，预算金额：1,730,000元', source: 'bocd.com.cn', url: 'https://pcms.bocd.com.cn/cms/cmscaigougg/3467a9dd597742fbb2efb0e1a17c0b4b.html', category: 'bid', tags: JSON.stringify(['招标', '采购']), publish_date: '2025-09-22'},
    {title: '中国邮政储蓄银行信用卡中心2025-2027年信用卡用卡保障权益服务采购项目', summary: '中国邮政储蓄银行信用卡中心2025-2027年信用卡用卡保障权益服务采购项目公开招标', source: 'chinapost.com.cn', url: 'https://www.chinapost.com.cn/html1/report/2511/4263-1.htm', category: 'bid', tags: JSON.stringify(['招标', '采购']), publish_date: '2025-11-12'},
    {title: '广发银行杭州分行2025年网络渠道信用卡获客项目', summary: '广发银行杭州分行2025年网络渠道信用卡获客项目招标公告', source: 'qianlima.com', url: 'https://industry.qianlima.com/industry/506302-30', category: 'bid', tags: JSON.stringify(['招标', '采购']), publish_date: '2025-10-29'},
    {title: '中国邮政储蓄银行2025-2027年信用卡非银联渠道商圈服务采购项目', summary: '中国邮政储蓄银行2025-2027年信用卡非银联渠道商圈服务采购项目，总营销补贴30542万元', source: 'weixin', url: 'http://mp.weixin.qq.com/s?__biz=Mzk1NzY1ODEyMQ==&mid=2247490385&idx=1&sn=8cd388cd864fe1caa33151ac5fdd3266', category: 'bid', tags: JSON.stringify(['招标', '采购']), publish_date: '2025-09-02'}
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