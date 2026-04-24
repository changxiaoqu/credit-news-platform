// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 精简版初始数据（保证各类别都有代表性数据）
const initialData = [
    // ===== Policy 政策 =====
    {title: '《信用卡业务监督管理办法》修订版正式发布', summary: '国家金融监督管理总局发布修订后的《信用卡业务监督管理办法》，自2026年5月1日起施行。新规对信用卡授信管理、风险防控、消费者权益保护等方面进行了全面完善。', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn/policy/1', category: 'policy', tags: '["信用卡","风控","监管","签约"]', publish_date: '2026-04-01', policy_no: '金监规〔2026〕8号', issuing_authority: '国家金融监督管理总局', effective_date: '2026-05-01', policy_level: '部门规章', key_points: '明确信用卡资金不得用于投资、购房等非消费领域；强化授信额度动态管理；完善消费者权益保护机制', is_key_policy: 1},
    {title: '央行：进一步加强信用卡分期业务管理', summary: '中国人民银行发布通知，要求各银行加强信用卡分期业务管理，规范分期手续费披露，禁止诱导性营销。', source: '中国人民银行', url: 'https://www.pbc.gov.cn/policy/2', category: 'policy', tags: '["信用卡","消费信贷","监管","支付"]', publish_date: '2026-03-15', policy_no: '银发〔2026〕45号', issuing_authority: '中国人民银行', effective_date: '2026-04-01', policy_level: '规范性文件', key_points: '分期手续费必须明示年化利率；禁止默认勾选分期；加强分期营销合规管理', is_key_policy: 1},
    {title: '关于规范信用卡积分业务的指导意见', summary: '银保监会发布指导意见，规范信用卡积分累积、兑换和使用，保护持卡人合法权益。', source: '银保监会', url: 'https://www.cbirc.gov.cn/policy/3', category: 'policy', tags: '["信用卡","权益营销","小程序"]', publish_date: '2026-02-15', policy_no: '银保监办发〔2026〕23号', issuing_authority: '银保监会', effective_date: '2026-03-01', policy_level: '规范性文件', key_points: '积分规则须清晰透明；禁止单方面调整已累积积分价值；保障持卡人积分兑换权益', is_key_policy: 0},
    {title: '金融数据安全管理办法：信用卡数据保护新规', summary: '《金融数据安全管理办法》正式施行，对信用卡业务中的个人数据收集、使用、存储提出更高要求。', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn/policy/4', category: 'policy', tags: '["信用卡","大数据","风控","支付"]', publish_date: '2026-01-15', policy_no: '金监规〔2026〕2号', issuing_authority: '国家金融监督管理总局', effective_date: '2026-02-01', policy_level: '部门规章', key_points: '强化信用卡持卡人数据保护；规范数据共享和外包管理；明确数据安全责任', is_key_policy: 1},
    {title: '商业银行信用卡业务监督管理办法（2025修订版）', summary: '银保监会发布新修订的信用卡业务监督管理办法，对信用卡申请、额度管理、息费收取等作出新规定。', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn/policy/5', category: 'policy', tags: '["信用卡","监管","签约"]', publish_date: '2025-07-01', policy_no: '银保监规〔2025〕13号', issuing_authority: '国家金融监督管理总局', effective_date: '2025-07-01', policy_level: '部门规章', key_points: '债务收入比不超过55%；严格管控资金流向；睡眠卡比例不超过20%', is_key_policy: 1},
    {title: '央行发布支付机构管理新规', summary: '中国人民银行发布支付机构分类评级新规，对支付机构进行A-E分类监管，自2026年2月1日起实施。', source: '中国人民银行', url: 'https://www.pbc.gov.cn/policy/6', category: 'policy', tags: '["支付","监管","支付"]', publish_date: '2026-01-01', policy_no: '银发〔2026〕8号', issuing_authority: '中国人民银行', effective_date: '2026-02-01', policy_level: '规范性文件', key_points: '支付机构分类评级A-E共5类11级；差异化监管措施；备付金管理要求', is_key_policy: 0},
    {title: '微信小程序虚拟支付业务管理规范', summary: '微信团队发布小程序虚拟支付业务管理规范更新公告，要求开发者4月1日前接入虚拟支付。', source: '微信支付', url: 'https://pay.weixin.qq.com/policy/7', category: 'policy', tags: '["小程序","支付","小程序"]', publish_date: '2026-03-02', policy_no: '', issuing_authority: '腾讯公司', effective_date: '2026-04-01', policy_level: '行业规范', key_points: 'iOS端虚拟支付享受15%优惠费率；虚拟商品需接入小程序虚拟支付；未接入将被判定违规', is_key_policy: 0},
    {title: '电子支付指引修改：单笔不超1000元限制拟取消', summary: '央行发布《修改〈电子支付指引（第一号）〉等4件规范性文件有关公告》，拟取消电子支付单笔1000元限额。', source: '中国人民银行', url: 'https://www.pbc.gov.cn/policy/8', category: 'policy', tags: '["支付","监管","支付"]', publish_date: '2025-09-01', policy_no: '银发〔2025〕120号', issuing_authority: '中国人民银行', effective_date: '待定', policy_level: '规范性文件', key_points: '删除电子支付单笔限额；信用卡透支利率市场化；简化信息披露要求', is_key_policy: 0},

    // ===== News 行业资讯 =====
    {title: '年内超45款信用卡被停发！发卡量三年锐减1.11亿张', summary: '2026年开年以来，农业银行、民生银行、交通银行、广发银行等多家银行密集发布公告，宣布停止发行多款信用卡产品。民生银行一次性叫停11款联名信用卡产品。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: '["行业","停发潮"]', publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着2024年7月信用卡新规全面实施，银行业从过去的跑马圈地增量竞赛正式转入存量博弈时代。2025年已有66家信用卡分中心关停，多家银行相继关停独立信用卡App。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: '["行业","存量经营"]', publish_date: '2026-04-19'},

    // ===== Risk 处罚数据 =====
    {title: '建设银行信用卡中心被罚575.27万元', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.27万元。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡中心"]', publish_date: '2026-03-23', penalty_amount: 575.27, penalized_institution: '建设银行信用卡中心', institution_level: '总行级', parent_bank: '建设银行', bank_type: '国有大型银行', penalty_authority: '上海金融监管局', penalty_date: '2026-03-23', penalty_reason: '客户资信水平调查严重违反审慎经营规则', penalty_document_no: '沪金罚决字〔2026〕12号'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元', summary: '2026年一季度，中国人民银行，国家金融监督管理总局及各分局共开出处罚记录625条，罚单金额总计5.76亿元，涉及银行机构至少586家。信贷违规仍是"重灾区"。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: '["处罚","监管"]', publish_date: '2026-04-01', penalty_amount: 57600, penalized_institution: '银行业金融机构', institution_level: '多家', parent_bank: '多家银行', bank_type: '综合', penalty_authority: '人行/金监局', penalty_date: '2026-04-01', penalty_reason: '信贷违规等'},
    {title: '宁波银行信用卡被罚85万元', summary: '宁波银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn?_id=r01', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-12', penalty_amount: 85, penalized_institution: '宁波银行信用卡中心', institution_level: '分行级', parent_bank: '宁波银行', bank_type: '城商行', penalty_authority: '宁波银保监局', penalty_date: '2026-04-12', penalty_reason: '信用卡业务违规'},
    {title: '江苏银行信用卡被罚120万元', summary: '江苏银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn?_id=r02', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-08', penalty_amount: 120, penalized_institution: '江苏银行信用卡中心', institution_level: '分行级', parent_bank: '江苏银行', bank_type: '城商行', penalty_authority: '江苏银保监局', penalty_date: '2026-04-08', penalty_reason: '信用卡业务违规'},
    {title: '广州农商行信用卡被罚180万元', summary: '广州农村商业银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn?_id=r10', category: 'risk', tags: '["农商行"]', publish_date: '2026-04-15', penalty_amount: 180, penalized_institution: '广州农村商业银行信用卡中心', institution_level: '分行级', parent_bank: '广州农村商业银行', bank_type: '农商行', penalty_authority: '广东银保监局', penalty_date: '2026-04-15', penalty_reason: '信用卡业务违规'},

    // ===== Business 商机信息 =====
    {title: '苏州银行信用卡智能风控系统升级项目启动需求调研', summary: '苏州银行信用卡部计划对现有风控系统进行智能化升级，预算500-800万元，预计下半年启动招标，正在对接潜在技术供应商。', source: '信用卡资讯平台整理', url: 'business://1', category: 'business', tags: '["智能风控","信用卡"]', publish_date: '2026-04-18', project_name: '苏州银行信用卡智能风控系统升级', procuring_entity: '苏州银行信用卡部', budget: '500-800万元'},
    {title: '宁波银行寻求信用卡分期业务场景合作方', summary: '宁波银行信用卡中心公开征集优质消费场景合作方，合作模式为联合运营或导流分成，重点合作领域包括3C数码、家电、医美、教育分期。', source: '信用卡资讯平台整理', url: 'business://2', category: 'business', tags: '["场景金融","分期合作"]', publish_date: '2026-04-15', project_name: '宁波银行信用卡分期场景合作', procuring_entity: '宁波银行信用卡中心', budget: '待定'},
    {title: '江南农商行信用卡数字化运营平台采购需求', summary: '江南农村商业银行计划采购信用卡数字化运营平台，涵盖客户生命周期管理、营销自动化、权益运营等模块，预算350万元。', source: '信用卡资讯平台整理', url: 'business://3', category: 'business', tags: '["数字化运营","信用卡"]', publish_date: '2026-04-12', project_name: '江南农商行信用卡数字化运营平台', procuring_entity: '江南农村商业银行', budget: '350万元'},

    // ===== Bid 投标信息 =====
    {title: '四川银行双录服务系统2025年度升级项目', summary: '预算138万元，广州佰锐网络科技有限公司中标130万元，对双录服务系统进行年度升级改造。', source: '四川银行', url: 'https://www.scbank.cn/cn/col322/6510307.html', category: 'bid', tags: '["双录","系统升级"]', publish_date: '2026-04-15', project_name: '四川银行双录服务系统2025年度升级', procuring_entity: '四川银行', budget: '138万元', bid_deadline: '2026-04-20', winner: '广州佰锐网络科技有限公司', winner_amount: '130万元'},
    {title: '2026年建行银联信用卡分行特惠场景活动宣传服务商采购', summary: '中国银联采购1家服务商，为建行银联信用卡分行特惠场景活动提供全周期统筹落地与宣传推广服务。', source: '中国银联', url: 'https://zaoyangshi.jrzb.com/purchases/2026-04-11', category: 'bid', tags: '["信用卡","营销活动"]', publish_date: '2026-04-11', project_name: '建行银联信用卡分行特惠场景活动宣传服务', procuring_entity: '中国银联', budget: '待定', bid_deadline: '2026-04-25'},
    {title: '江苏省联社新核心业务系统项目测试服务招标', summary: '江苏省农村信用社联合社新核心业务系统项目测试服务招标，服务范围涵盖功能测试、性能测试等。', source: '江苏省联社', url: 'http://www.js96008.com/cn/khfw/zxgg/2893.html', category: 'bid', tags: '["系统测试","省联社"]', publish_date: '2026-04-09', project_name: '江苏省联社新核心业务系统测试服务', procuring_entity: '江苏省农村信用社联合社', budget: '待定', bid_deadline: '2026-04-30'},
];

async function initData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) { reject(err); return; }
            console.log('Starting data init at', new Date().toISOString());
            
            // 使用 serialize 确保串行执行，加快速度
            db.serialize(() => {
                // 删除旧数据
                db.run(`DELETE FROM articles WHERE category IN ('business','policy','news','risk','bid')`, (err) => {
                    if (err) console.error('Delete error:', err.message);
                    console.log('Old data deleted');
                });

                // 批量插入（一次插入所有数据）
                const placeholders = initialData.map(() => 
                    '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
                ).join(',');
                
                const values = [];
                initialData.forEach(item => {
                    values.push(
                        item.title, item.summary, item.content || '', item.source, item.url,
                        item.category, item.tags, item.publish_date,
                        item.is_important || 0, item.penalty_amount || null, item.penalized_institution || null,
                        item.institution_level || null, item.parent_bank || null, item.bank_type || null,
                        item.penalty_authority || null, item.penalty_date || null, item.penalty_reason || null,
                        item.penalty_document_no || null, item.other_punishments || null, item.project_name || null,
                        item.procuring_entity || null, item.procuring_level || null, item.budget || null,
                        item.bid_deadline || null, item.bid_status || null, item.winner || null,
                        item.winner_amount || null, item.core_requirements || null, item.policy_no || null,
                        item.issuing_authority || null, item.effective_date || null, item.policy_level || null,
                        item.key_points || null, item.is_key_policy || 0
                    );
                });

                const sql = `INSERT INTO articles (
                    title, summary, content, source, url, category, tags, publish_date,
                    is_important, penalty_amount, penalized_institution, institution_level, parent_bank, bank_type,
                    penalty_authority, penalty_date, penalty_reason, penalty_document_no, other_punishments,
                    project_name, procuring_entity, procuring_level, budget, bid_deadline, bid_status,
                    winner, winner_amount, core_requirements, policy_no, issuing_authority, effective_date,
                    policy_level, key_points, is_key_policy
                ) VALUES ${placeholders}`;

                db.run(sql, values, function(err) {
                    if (err) {
                        console.error('Insert error:', err.message);
                    } else {
                        console.log(`Data initialized: inserted ${this.changes} articles`);
                    }
                    resolve();
                });
            });
        });
    });
}

module.exports = { initData };
