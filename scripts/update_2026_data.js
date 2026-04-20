#!/usr/bin/env node
/**
 * 更新信用卡资讯平台数据脚本
 * 将2026年1-4月的数据插入到SQLite数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/news.db');

// 2026年1-4月监管政策数据
const policies = [
    {
        title: "网传2026年7月信用卡逾期新规为谣言",
        summary: "经核实，央行、银保监会官方渠道未发布任何关于2026年信用卡逾期新规的公告。网传消息缺乏权威依据，属未经证实的传言。",
        source: "半岛网",
        url: "https://news.bandao.cn/bdfalv/yqlaw/ykzhishi/579670.html",
        category: "policy",
        tags: ["监管", "政策", "辟谣"],
        publish_date: "2026-02-23"
    },
    {
        title: "金融监管总局：探索开展线上开立和激活信用卡业务",
        summary: "金融监管总局印发通知，要求金融机构发展消费金融，助力提振消费。在有效核实身份、风险可控前提下，探索开展线上开立和激活信用卡业务。",
        source: "新浪财经",
        url: "https://finance.sina.cn/2025-03-27/detail-ineqznmc8553648.d.html",
        category: "policy",
        tags: ["监管", "政策", "线上开卡"],
        publish_date: "2026-03-27"
    },
    {
        title: "财政部等三部门：信用卡账单分期纳入财政贴息范围",
        summary: "财政部、中国人民银行、金融监管总局发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年底，信用卡账单分期业务纳入支持范围，年贴息比例1个百分点。",
        source: "国家金融监督管理总局",
        url: "https://www.nfra.gov.cn/cn/view/pages/ItemDetail.html?docId=1243763",
        category: "policy",
        tags: ["监管", "政策", "财政贴息"],
        publish_date: "2026-01-20"
    }
];

// 2026年1-4月行业资讯数据
const industryNews = [
    {
        title: "多家银行密集停发信用卡，前4月已停发超42款产品",
        summary: "2026年开年以来，信用卡市场停发潮持续蔓延。民生银行停发11款、农业银行停发13款、交通银行、广发银行等多家银行宣布停发超过42款信用卡产品，其中绝大多数是联名卡和主题卡。",
        source: "21世纪经济报道",
        url: "https://www.21jingji.com/article/20260415/herald/073dc3878a179cb2d39499d7ceb5457b.html",
        category: "industry",
        tags: ["行业", "停发潮", "联名卡"],
        publish_date: "2026-04-15"
    },
    {
        title: "全国信用卡发卡量跌破7亿张，创近7年新低",
        summary: "央行数据显示，截至2025年末，全国信用卡和借贷合一卡数量为6.96亿张，较2024年末减少约3100万张。信用卡发卡量已连续三年下滑，规模逼近2018年末水平。",
        source: "证券时报",
        url: "https://www.stcn.com/article/detail/3757804.html",
        category: "industry",
        tags: ["行业", "发卡量", "趋势"],
        publish_date: "2026-04-16"
    },
    {
        title: "2025年66家信用卡分中心关停，渠道加速收缩",
        summary: "银行渠道端加速收缩，2025年已有66家信用卡分中心关停，多家银行相继关停独立信用卡App，将功能迁移至手机银行。从国有大行到中小银行，信用卡业务正在经历深刻调整。",
        source: "每日经济新闻",
        url: "https://www.nbd.com.cn/articles/2026-04-19/4346106.html",
        category: "industry",
        tags: ["行业", "渠道", "分中心"],
        publish_date: "2026-04-19"
    }
];

// 2026年1-4月处罚数据
const penalties = [
    {
        title: "建设银行信用卡中心被罚575.27万元",
        summary: "上海金融监管局对建设银行信用卡中心开出罚单，涉及14项违规：客户资信水平调查严重违反审慎经营规则、授信额度管理违规、信用卡分期资金管理违规、催收外包管理违规等。",
        source: "国家金融监督管理总局",
        url: "https://www.guancha.cn/GuanJinRong/2026_03_23_811083.shtml",
        category: "penalty",
        tags: ["处罚", "建设银行", "信用卡中心"],
        publish_date: "2026-03-23"
    },
    {
        title: "建设银行总行被罚4350.61万元",
        summary: "中国人民银行对建设银行开出大额罚单，涉及违反账户管理规定、未按规定履行客户身份识别义务、未按规定报送大额交易报告、与身份不明的客户进行交易等10项违法违规。",
        source: "央行",
        url: "https://finance.sina.cn/2026-04-10/detail-inhtyfhe1477268.d.html",
        category: "penalty",
        tags: ["处罚", "建设银行", "反洗钱"],
        publish_date: "2026-02-14"
    },
    {
        title: "中信银行杭州分行被罚625万元",
        summary: "浙江金融监管局对中信银行杭州分行开出罚单，违规事项包括贷款管理不审慎、票据业务管理不到位等，相关负责人邵炳斌、袁佳等14人被警告。",
        source: "国家金融监督管理总局",
        url: "https://m.cnfin.com/yw-lb//zixun/20260410/4397696_1.html",
        category: "penalty",
        tags: ["处罚", "中信银行", "贷款违规"],
        publish_date: "2026-02-06"
    },
    {
        title: "厦门农商行被罚605万元",
        summary: "厦门金融监管局对厦门农村商业银行开出2026年1号罚单，涉及公司治理、信贷、信用卡、理财、同业业务管理不审慎、不到位，8名责任人同步被追责。",
        source: "厦门金融监管局",
        url: "https://fintecdaily.com/xiamennongshanghang216/",
        category: "penalty",
        tags: ["处罚", "农商行", "厦门"],
        publish_date: "2026-02-16"
    },
    {
        title: "中国银行青海省分行信用卡业务管理不到位被罚55万元",
        summary: "青海金融监管局对中国银行青海省分行开出罚单，因信用卡业务管理不到位被处罚款55万元，时任风险管理部总经理马宁育、信用卡部总经理杨峰伟被追责。",
        source: "国家金融监督管理总局",
        url: "https://www.sohu.com/a/999411130_100053070",
        category: "penalty",
        tags: ["处罚", "中国银行", "信用卡"],
        publish_date: "2026-03-20"
    }
];

// 2026年1-4月投标信息
const bids = [
    {
        title: "湖南银行2026年信用卡线上营销活动项目",
        summary: "湖南银行信用卡线上营销活动项目公开招标，预算193.9万元，要求投标人具备3个及以上国有大行或全国性股份制银行信用卡线上营销活动成功案例。",
        source: "湖南银行",
        url: "https://www.hunan-bank.com/96599/2026-04/07/article_2026040710591792837.shtml",
        category: "bid",
        tags: ["招标", "湖南银行", "营销"],
        publish_date: "2026-04-07"
    },
    {
        title: "广州农商行2026-2027年信用卡中心服务外包项目",
        summary: "广州农村商业银行信用卡中心服务外包项目公开招标，预算804万元，采购828人月外包服务，涵盖客户服务、催收、营销等。",
        source: "广州农商行",
        url: "https://www.grcbank.com/grcbank/gywx/cggg/2026032416151748215/index.shtml",
        category: "bid",
        tags: ["招标", "农商行", "外包"],
        publish_date: "2026-03-24"
    },
    {
        title: "光大银行信用卡网络安全设备维保服务采购",
        summary: "中国光大银行信用卡网络安全设备维保服务采购项目，购入三年期网络攻击蜜罐、网络全流量深度威胁分析设备平台、APT防御设备、数据库安全设备等维保服务。",
        source: "光大银行",
        url: "https://www.cntcitc.com.cn/more.html?contentId=ce710710548d4790971bb68d127918e9",
        category: "bid",
        tags: ["招标", "光大银行", "网络安全"],
        publish_date: "2026-03-16"
    },
    {
        title: "邮储银行2026-2029年信用卡中心欺诈风险识别数据服务",
        summary: "中国邮政储蓄银行信用卡中心欺诈风险识别数据服务采购项目，采购欺诈风险识别数据510万笔。",
        source: "邮储银行",
        url: "https://www.chinapost.com.cn/html1/report/26018/5133-1.htm",
        category: "bid",
        tags: ["招标", "邮储银行", "风控"],
        publish_date: "2026-01-22"
    },
    {
        title: "中信银行信用卡中心法律诉讼业务材料处理外包",
        summary: "中信银行信用卡中心法律诉讼业务材料处理外包服务采购项目，涵盖诉讼材料整理、归档、数字化处理等服务。",
        source: "中信银行",
        url: "https://ebid.cfhc.citic/cms/default/webfile/ywgg1/20260306/1214656725957738496.html",
        category: "bid",
        tags: ["招标", "中信银行", "外包"],
        publish_date: "2026-03-06"
    },
    {
        title: "恒丰银行2026年信用卡实物礼品项目",
        summary: "恒丰银行2026年信用卡实物礼品项目采购公告，为红色名城信用卡、恒享福卡配置实物礼品，建立长期稳定的信用卡实物礼品资源池。",
        source: "恒丰银行",
        url: "https://hfbank.com.cn/gyhf/cgpt/jzcg/cggg/314163.shtml",
        category: "bid",
        tags: ["招标", "恒丰银行", "礼品"],
        publish_date: "2026-02-24"
    },
    {
        title: "建设银行河南省分行零售信贷不良贷款诉讼催收外包",
        summary: "建设银行河南省分行零售信贷集约化不良贷款诉讼催收外包项目，预算5476.95万元，涵盖普惠、房金、乡金、信用卡条线催收。",
        source: "建设银行",
        url: "https://www.hnzbcg.cn/zhaobiao/158171.html",
        category: "bid",
        tags: ["招标", "建设银行", "催收"],
        publish_date: "2025-12-23"
    }
];

// 合并所有数据
const allData = [...policies, ...industryNews, ...penalties, ...bids];

// 初始化数据库连接
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

// 保存单条文章
async function saveArticle(db, article) {
    const exists = await articleExists(db, article.url);
    if (exists) {
        console.log(`  [跳过-已存在] ${article.title.substring(0, 50)}...`);
        return false;
    }

    const sql = `
        INSERT INTO articles (title, summary, source, url, category, tags, publish_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [
            article.title,
            article.summary,
            article.source,
            article.url,
            article.category,
            JSON.stringify(article.tags),
            article.publish_date
        ], function(err) {
            if (err) {
                console.error(`  [错误] ${err.message}`);
                resolve(false);
            } else {
                console.log(`  [新增] ${article.title.substring(0, 50)}...`);
                resolve(true);
            }
        });
    });
}

// 主函数
async function main() {
    console.log('='.repeat(70));
    console.log('📊 信用卡资讯平台数据更新 - 2026年1-4月');
    console.log('='.repeat(70));
    console.log(`开始时间: ${new Date().toLocaleString()}`);
    console.log('');

    let db;
    let stats = {
        policy: { added: 0, skipped: 0 },
        industry: { added: 0, skipped: 0 },
        penalty: { added: 0, skipped: 0 },
        bid: { added: 0, skipped: 0 }
    };

    try {
        db = await initDB();
        console.log(`✅ 数据库连接成功: ${DB_PATH}`);
        console.log('');

        // 按类别分组显示
        const categories = {
            '监管政策': policies,
            '行业资讯': industryNews,
            '处罚数据': penalties,
            '投标信息': bids
        };

        for (const [catName, catData] of Object.entries(categories)) {
            console.log(`\n📁 ${catName} (${catData.length}条)`);
            console.log('-'.repeat(70));
            
            for (const article of catData) {
                const saved = await saveArticle(db, article);
                const catKey = article.category;
                if (saved) {
                    stats[catKey].added++;
                } else {
                    stats[catKey].skipped++;
                }
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📈 更新统计');
        console.log('='.repeat(70));
        console.log(`监管政策: 新增 ${stats.policy.added} 条, 跳过 ${stats.policy.skipped} 条`);
        console.log(`行业资讯: 新增 ${stats.industry.added} 条, 跳过 ${stats.industry.skipped} 条`);
        console.log(`处罚数据: 新增 ${stats.penalty.added} 条, 跳过 ${stats.penalty.skipped} 条`);
        console.log(`投标信息: 新增 ${stats.bid.added} 条, 跳过 ${stats.bid.skipped} 条`);
        console.log('-'.repeat(70));
        const totalAdded = stats.policy.added + stats.industry.added + stats.penalty.added + stats.bid.added;
        const totalSkipped = stats.policy.skipped + stats.industry.skipped + stats.penalty.skipped + stats.bid.skipped;
        console.log(`总计: 新增 ${totalAdded} 条, 跳过 ${totalSkipped} 条`);
        console.log('='.repeat(70));

    } catch (err) {
        console.error('❌ 更新失败:', err);
        process.exit(1);
    } finally {
        if (db) {
            db.close();
            console.log('\n✅ 数据库连接已关闭');
        }
    }
}

// 运行主函数
main();
