// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 精简版初始数据（保证各类别都有代表性数据）
const initialData = [
    // ========== 监管政策 (policy) ==========
    {title: '三部门：个人消费贷款贴息政策延至2026年底，信用卡账单分期纳入支持范围', summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年12月31日，首次将信用卡账单分期业务纳入贴息支持范围，年贴息比例为1个百分点。', source: '财政部/央行/金融监管总局', url: 'https://www.nfra.gov.cn', category: 'policy', tags: '["政策","消费贷款"]', publish_date: '2026-01-20', policy_no: '财金〔2026〕1号', issuing_authority: '财政部/中国人民银行/金融监管总局', effective_date: '2025-09-01', policy_level: '规范性文件', key_points: '信用卡账单分期纳入贴息范围，年贴息1%', is_key_policy: 1},
    {title: '《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施', summary: '2026年1月1日起，三部门联合发布的《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施。将过去的"客户身份识别"升级为"客户尽职调查"，要求银行穿透识别受益所有人。', source: '央行/金融监管总局/证监会', url: 'https://www.pbc.gov.cn/', category: 'policy', tags: '["政策","反洗钱"]', publish_date: '2026-01-01', policy_no: '人行/金监/证监会令〔2025〕第3号', issuing_authority: '中国人民银行/国家金融监管总局/证监会', effective_date: '2026-01-01', policy_level: '部门规章', key_points: '客户身份识别升级为客户尽职调查，穿透识别受益所有人', is_key_policy: 0},
    {title: '信用卡个性化分期新规：2026年起不得强制要求提供担保人', summary: '国家金融监管总局发布《关于优化信用卡债务纾困机制的通知》，明确从2026年1月1日起，金融机构办理信用卡个性化分期业务时，不得强制要求持卡人提供担保人。', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'policy', tags: '["监管政策","信用卡协商","债务纾困"]', publish_date: '2026-01-01', policy_no: '金规〔2025〕XX号', issuing_authority: '国家金融监督管理总局', effective_date: '2026-01-01', policy_level: '规范性文件', key_points: '信用卡个性化分期不得强制要求提供担保人', is_key_policy: 1},

    // ========== 行业资讯 (news) ==========
    {title: '年内超45款信用卡被停发！信用卡发卡量三年锐减1.11亿张', summary: '2026年开年以来，农业银行、民生银行、交通银行、广发银行等多家银行密集发布公告，宣布停止发行多款信用卡产品。民生银行一次性叫停11款联名信用卡产品。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: '["行业","停发潮"]', publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着2024年7月信用卡新规全面实施，银行业从过去的跑马圈地增量竞赛正式转入存量博弈时代。2025年已有66家信用卡分中心关停，多家银行相继关停独立信用卡App。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: '["行业","存量经营"]', publish_date: '2026-04-19'},

    // ========== 处罚数据 (risk) ==========
    {title: '建设银行信用卡中心被罚575.27万元', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.27万元。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡中心"]', publish_date: '2026-03-23'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元', summary: '2026年一季度，中国人民银行，国家金融监督管理总局及各分局共开出处罚记录625条，罚单金额总计5.76亿元，涉及银行机构至少586家。信贷违规仍是"重灾区"，信用卡业务违规问题较为突出。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: '["处罚","监管"]', publish_date: '2026-04-01'},
    {title: '宁波银行信用卡被罚85万元', summary: '宁波银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn?_id=r01', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-12'},
    {title: '江苏银行信用卡被罚120万元', summary: '江苏银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn?_id=r02', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-08'},
    {title: '广州农商行信用卡被罚180万元', summary: '广州农村商业银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn?_id=r10', category: 'risk', tags: '["农商行"]', publish_date: '2026-04-15'},

    // ========== 商机信息 (business) ==========
    {title: '苏州银行信用卡智能风控系统升级项目启动需求调研', summary: '苏州银行信用卡部计划对现有风控系统进行智能化升级，重点方向包括实时交易反欺诈模型、信用卡额度动态调整引擎、异常行为识别等，预算区间500-800万元，预计下半年启动招标。', source: '信用卡资讯平台整理', url: 'business://1', category: 'business', tags: '["智能风控","信用卡","系统升级"]', publish_date: '2026-04-18'},
    {title: '宁波银行寻求信用卡分期业务场景合作方', summary: '宁波银行信用卡中心公开征集优质消费场景合作方，要求合作方具备线上分期获客和运营能力，合作模式为联合运营或导流分成。', source: '信用卡资讯平台整理', url: 'business://2', category: 'business', tags: '["场景金融","分期合作","联合运营"]', publish_date: '2026-04-15'},
    {title: '江南农商行信用卡数字化运营平台采购需求', summary: '江南农村商业银行计划采购一套信用卡数字化运营平台，涵盖客户生命周期管理、营销自动化、权益运营、数据分析等模块，预算350万元。', source: '信用卡资讯平台整理', url: 'business://3', category: 'business', tags: '["数字化运营","信用卡","采购"]', publish_date: '2026-04-12'},

    // ========== 投标信息 (bid) ==========
    {title: '四川银行双录服务系统2025年度升级项目', summary: '预算138万元，广州佰锐网络科技有限公司中标130万元，对双录服务系统进行年度升级改造。', source: '四川银行', url: 'https://www.scbank.cn/cn/col322/6510307.html', category: 'bid', tags: '[双录,系统升级]', publish_date: '2026-04-15'},
    {title: '2026年建行银联信用卡分行特惠场景活动宣传服务商采购', summary: '中国银联采购1家服务商，为建行银联信用卡分行特惠场景活动提供全周期统筹落地与全方位宣传推广服务。', source: '中国银联', url: 'https://zaoyangshi.jrzb.com/purchases/2026-04-11', category: 'bid', tags: '[信用卡,营销活动]', publish_date: '2026-04-11'},
    {title: '江苏省联社新核心业务系统项目测试服务招标', summary: '江苏省农村信用社联合社新核心业务系统项目测试服务招标，服务范围涵盖功能测试、性能测试等。', source: '江苏省联社', url: 'http://www.js96008.com/cn/khfw/zxgg/2893.html', category: 'bid', tags: '[系统测试,省联社]', publish_date: '2026-04-09'},
];

async function initData() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) { reject(err); return; }

            db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
                if (err) { reject(err); return; }
                console.log('Initializing data on every deploy, articles count:', row.count);

                // 每次部署强制删除旧数据重新插入
                db.exec(`DELETE FROM articles WHERE category IN ('business','policy','news','risk','bid')`, (err) => {
                    if (err) { console.error('Delete error:', err.message); }

                    const insertSql = `
                        INSERT OR IGNORE INTO articles (title, summary, content, source, url, category, tags, publish_date, penalty_amount, penalized_institution, institution_level, parent_bank, bank_type, penalty_authority, penalty_date, penalty_reason, penalty_document_no, other_punishments, project_name, procuring_entity, procuring_level, budget, bid_deadline, bid_status, winner, winner_amount, core_requirements, policy_no, issuing_authority, effective_date, policy_level, key_points, is_key_policy)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const stmt = db.prepare(insertSql);
                    let inserted = 0;
                    
                    initialData.forEach((item, index) => {
                        stmt.run([
                            item.title, item.summary, item.content || '', item.source, item.url,
                            item.category, item.tags, item.publish_date,
                            item.penalty_amount || null, item.penalized_institution || null,
                            item.institution_level || null, item.parent_bank || null, item.bank_type || null,
                            item.penalty_authority || null, item.penalty_date || null,
                            item.penalty_reason || null, item.penalty_document_no || null, item.other_punishments || null,
                            item.project_name || null, item.procuring_entity || null, item.procuring_level || null,
                            item.budget || null, item.bid_deadline || null, item.bid_status || null,
                            item.winner || null, item.winner_amount || null, item.core_requirements || null,
                            item.policy_no || null, item.issuing_authority || null, item.effective_date || null,
                            item.policy_level || null, item.key_points || null, item.is_key_policy || 0
                        ], function(err) {
                            if (err) console.error('Insert error:', err.message);
                            else inserted++;
                            
                            if (index === initialData.length - 1) {
                                stmt.finalize();
                                db.close();
                                console.log('Data initialized: inserted', inserted, 'articles');
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
