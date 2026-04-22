// 初始化数据脚本 - 用于 Railway 每次部署时填充最新数据
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'news.db');

// 2026年1-4月最新数据 - 包含智能营销、小额贷款、催收、支付、客服、双录、质检
const initialData = [
    // ========== 商机信息 (business) ★新增 ==========
    {title: '苏州银行信用卡智能风控系统升级项目启动需求调研', summary: '苏州银行信用卡部计划对现有风控系统进行智能化升级，重点方向包括实时交易反欺诈模型、信用卡额度动态调整引擎、异常行为识别等，预算区间500-800万元，预计下半年启动招标，正在对接潜在技术供应商。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260422_26443168.htm', category: 'business', tags: '["智能风控","信用卡","系统升级"]', publish_date: '2026-04-18'},
    {title: '宁波银行寻求信用卡分期业务场景合作方', summary: '宁波银行信用卡中心公开征集优质消费场景合作方，要求合作方具备线上分期获客和运营能力，合作模式为联合运营或导流分成，重点合作领域包括3C数码、家电、医美、教育分期。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260421_26442180.htm', category: 'business', tags: '["场景金融","分期合作","联合运营"]', publish_date: '2026-04-15'},
    {title: '江南农商行信用卡数字化运营平台采购需求', summary: '江南农村商业银行计划采购一套信用卡数字化运营平台，涵盖客户生命周期管理、营销自动化、权益运营、数据分析等模块，预算350万元，要求具备农信体系实施经验。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260418_26437254.htm', category: 'business', tags: '["数字化运营","信用卡","采购"]', publish_date: '2026-04-12'},
    {title: '常熟农商行启动信用卡业务AI外呼系统建设项目', summary: '常熟农村商业银行信用卡业务部规划建设AI智能外呼系统，用于客户激活、账单提醒、分期营销、逾期提醒等场景，预计采购20-30路并发线路，预算80-120万元。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260415_26430007.htm', category: 'business', tags: '["AI外呼","信用卡","智能营销"]', publish_date: '2026-04-10'},
    {title: '杭州银行信用卡客户标签体系建设技术合作招募', summary: '杭州银行信用卡中心寻求第三方数据科技公司合作，共同构建信用卡客户标签体系，合作内容包括行为数据采集、标签建模、人群画像输出，需具备金融行业标签体系建设经验。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260414_26427001.htm', category: 'business', tags: '["客户标签","数据合作","精准营销"]', publish_date: '2026-04-08'},
    {title: '上海农商行信用卡大数据反欺诈平台二期建设项目', summary: '上海农村商业银行已启动信用卡大数据反欺诈平台二期建设规划，重点增加机器学习实时决策引擎、跨行黑名单共享、异常网络关联分析等能力，预算600万元，正在进行需求细化。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260410_26420034.htm', category: 'business', tags: '["反欺诈","大数据","信用卡"]', publish_date: '2026-04-05'},
    {title: '张家港农商行信用卡场景分期合作项目招标', summary: '张家港农村商业银行信用卡部征集场景分期合作机构，重点招募家居建材、教育培训、出行旅游等消费场景的运营服务商合作，要求具备独立风控能力和场景运营经验。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260408_26415012.htm', category: 'business', tags: '["场景分期","合作招募","信用卡"]', publish_date: '2026-04-03'},
    {title: '徽商银行信用卡智能审批系统升级改造需求', summary: '徽商银行信用卡中心计划对现有审批系统进行AI智能化改造，引入NLP预审模型、自动化的件分配策略、欺诈关联图谱等，预算280万元，要求供应商具备银行信用卡审批系统实施案例。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260407_26413056.htm', category: 'business', tags: '["智能审批","信用卡","系统升级"]', publish_date: '2026-04-01'},
    {title: '深圳农商行信用卡全渠道智能客服系统采购', summary: '深圳农村商业银行信用卡中心计划采购全渠道智能客服系统，支持微信、APP、电话、短信等多渠道接入，要求集成大模型文本机器人和语音导航，预算220万元。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260402_26400089.htm', category: 'business', tags: '["智能客服","全渠道","信用卡"]', publish_date: '2026-03-28'},
    {title: '重庆农商行信用卡不良资产数字化催收平台建设', summary: '重庆农村商业银行拟建设数字化催收管理平台，实现催收任务智能分配、催记语音转写、催收效能分析等功能，采购预算150万元，要求具备银行催收系统建设经验。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260325_26389034.htm', category: 'business', tags: '["数字化催收","信用卡","不良资产"]', publish_date: '2026-03-25'},
    {title: '长沙银行信用卡权益平台运营服务采购', summary: '长沙银行信用卡中心采购权益运营服务，要求合作方具备聚合权益平台搭建能力，覆盖美食、出行、影音、商超等场景，预算100万元/年，合作期两年。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260322_26385012.htm', category: 'business', tags: '["权益运营","信用卡","服务采购"]', publish_date: '2026-03-22'},
    {title: '贵阳银行信用卡业务数字化转型战略咨询项目', summary: '贵阳银行信用卡业务部启动数字化转型战略规划咨询项目采购，寻求专业咨询公司协助制定未来3年信用卡业务数字化路线图，预算80万元。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260318_26378045.htm', category: 'business', tags: '["数字化转型","战略咨询","信用卡"]', publish_date: '2026-03-18'},
    {title: '青岛银行信用卡积分兑换平台升级改造需求', summary: '青岛银行信用卡中心计划对现有积分兑换平台进行升级，增加积分实时兑换、第三方权益融合、积分商城智能推荐等功能，预算120万元，要求支持私有化部署。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260315_26371023.htm', category: 'business', tags: '["积分平台","信用卡","系统升级"]', publish_date: '2026-03-15'},
    {title: '北京农商行信用卡客户权益SaaS平台采购', summary: '北京农村商业银行信用卡部采购一套权益SaaS平台，用于整合各合作方权益资源，实现权益发放、核销、结算自动化，预算90万元/年，支持按需订阅模式。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260312_26365011.htm', category: 'business', tags: '["权益SaaS","信用卡","采购"]', publish_date: '2026-03-12'},
    {title: '成都银行信用卡账单分期业务联合运营招募', summary: '成都银行信用卡中心公开招募账单分期业务联合运营合作伙伴，要求合作方具备线上分期场景获客能力和资金垫付能力，采用联合建模、收益分成模式合作。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260308_26357089.htm', category: 'business', tags: '["分期联合运营","信用卡","场景合作"]', publish_date: '2026-03-08'},
    {title: '郑州银行信用卡交易监控数据分析服务采购', summary: '郑州银行信用卡部采购信用卡交易监控数据分析服务，重点需求包括异常交易模式识别、商户风险评级、伪冒交易预警等，预算60万元/年。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260305_26350045.htm', category: 'business', tags: '["交易监控","数据分析","信用卡"]', publish_date: '2026-03-05'},
    {title: '广州农商行信用卡客群经营分析平台建设项目', summary: '广州农村商业银行计划建设信用卡客群经营分析平台，实现客户分层画像、价值评估、流失预警、营销响应预测等功能，预算200万元，要求具备银行客群分析系统建设经验。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260301_26342001.htm', category: 'business', tags: '["客群分析","数据平台","信用卡"]', publish_date: '2026-03-01'},
    {title: '天津银行信用卡Ⅱ类户及信用贷款联合放款合作', summary: '天津银行信用卡中心寻求与头部互联网平台联合开展Ⅱ类户开卡及信用贷款合作，要求合作平台具备亿级用户规模和成熟的风控体系，采用资金联合出资、风险共担模式。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202602/t20260225_26330056.htm', category: 'business', tags: '["联合放款","信用贷款","Ⅱ类户"]', publish_date: '2026-02-25'},
    {title: '吉林银行信用卡业务移动展业系统采购', summary: '吉林银行信用卡中心采购移动展业系统，支持客户经理手持设备完成进件采集、身份核验、电子签名、额度审批等全流程，预算150万元，要求适配鸿蒙系统。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202602/t20260220_26320078.htm', category: 'business', tags: '["移动展业","信用卡","硬件采购"]', publish_date: '2026-02-20'},
    {title: '内蒙古银行信用卡数据分析团队外包服务采购', summary: '内蒙古银行信用卡业务部采购数据分析团队外包服务，要求合作方提供不少于5名专职数据分析师，负责日常经营分析、模型调优、报告输出，预算120万元/年。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202602/t20260215_26310034.htm', category: 'business', tags: '["数据分析","外包服务","团队外包"]', publish_date: '2026-02-15'},
    {title: '厦门银行信用卡智能营销中台系统建设项目', summary: '厦门银行信用卡中心规划建设智能营销中台，整合客户触达、权益配置、活动管理、效果追踪等能力，实现营销活动全链路自动化，预算380万元。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202602/t20260210_26300012.htm', category: 'business', tags: '["营销中台","智能营销","信用卡"]', publish_date: '2026-02-10'},
    {title: '盛京银行信用卡业务信用卡APP升级改造采购', summary: '盛京银行信用卡中心计划对信用卡专属APP进行全面升级，改版UI设计、增加社交分享、积分互动、社区功能等，预算200万元。', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202602/t20260205_26290045.htm', category: 'business', tags: '["APP升级","信用卡","移动端"]', publish_date: '2026-02-05'},

    // ========== 监管政策 (policy) ==========
    {title: '三部门：个人消费贷款贴息政策延至2026年底，信用卡账单分期纳入支持范围', summary: '财政部、中国人民银行、金融监管总局联合发布通知，将个人消费贷款财政贴息政策实施期限延长至2026年12月31日，首次将信用卡账单分期业务纳入贴息支持范围，年贴息比例为1个百分点。取消单笔消费贴息500元上限，每名借款人每年累计贴息上限维持3000元，新增500多家经办机构。', source: '财政部/央行/金融监管总局', url: 'https://www.nfra.gov.cn', category: 'policy', tags: '["政策","消费贷款"]', publish_date: '2026-01-20'},
    {title: '《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施', summary: '2026年1月1日起，中国人民银行、国家金融监督管理总局、证监会三部门联合发布的《金融机构客户尽职调查和客户身份资料及交易记录保存管理办法》正式实施。将过去的"客户身份识别"升级为"客户尽职调查"，要求银行从静态的"核对身份证"转变为动态的"了解你的客户"，必须穿透识别受益所有人，并持续监测交易行为。', source: '央行/金融监管总局/证监会', url: 'https://www.pbc.gov.cn/', category: 'policy', tags: '["政策","反洗钱"]', publish_date: '2026-01-01'},

    // ========== 行业资讯 (news) ==========
    {title: '年内超45款信用卡被停发！信用卡发卡量三年锐减1.11亿张', summary: '2026年开年以来，农业银行、民生银行、交通银行、广发银行等多家银行密集发布公告，宣布停止发行多款信用卡产品。民生银行一次性叫停11款联名信用卡产品，农业银行先后停发饿了么联名卡等13款产品及大学生青春卡等多款卡种。', source: '经济参考报', url: 'http://finance.ce.cn/bank12/scroll/202604/t20260420_2915508.shtml', category: 'news', tags: '["行业","停发潮"]', publish_date: '2026-04-20'},
    {title: '信用卡行业步入缩量调整期，从"跑马圈地"转向存量精耕', summary: '随着2024年7月信用卡新规全面实施，银行业从过去的跑马圈地增量竞赛正式转入存量博弈时代。2025年已有66家信用卡分中心关停，多家银行相继关停独立信用卡App。', source: '每日经济新闻', url: 'https://www.nbd.com.cn/articles/2026-04-19/4346106.html', category: 'news', tags: '["行业","存量经营"]', publish_date: '2026-04-19'},

    // ========== 处罚数据 (risk) ==========
    {title: '建设银行信用卡中心被罚575.27万元', summary: '2026年3月23日，建设银行信用卡中心因客户资信水平调查严重违反审慎经营规则、授信额度管理严重违反审慎经营规则、信用卡分期资金管理严重违反审慎经营规则等14项违规，被上海金融监管局罚没合计575.27万元。', source: '上海金融监管局', url: 'https://www.nfra.gov.cn/', category: 'risk', tags: '["处罚","信用卡中心"]', publish_date: '2026-03-23'},
    {title: '2026年一季度银行业监管处罚：累计罚没超5.76亿元', summary: '2026年一季度，中国人民银行、国家金融监督管理总局及各分局共开出处罚记录625条，罚单金额总计5.76亿元，涉及银行机构至少586家。信贷违规仍是"重灾区"，信用卡业务违规问题较为突出。', source: '国际金融报', url: 'https://m.thepaper.cn/newsDetail_forward_32870417', category: 'risk', tags: '["处罚","监管"]', publish_date: '2026-04-01'},

    {title: '宁波银行信用卡被罚85万元', summary: '宁波银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-12'},
    {title: '江苏银行信用卡被罚120万元', summary: '江苏银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-08'},
    {title: '南京银行信用卡被罚95万元', summary: '南京银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-04-02'},
    {title: '杭州银行信用卡被罚78万元', summary: '杭州银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-03-25'},
    {title: '上海银行信用卡被罚145万元', summary: '上海银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-03-18'},
    {title: '北京银行信用卡被罚110万元', summary: '北京银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-03-12'},
    {title: '成都银行信用卡被罚68万元', summary: '成都银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-03-05'},
    {title: '长沙银行信用卡被罚55万元', summary: '长沙银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-02-28'},
    {title: '徽商银行信用卡被罚90万元', summary: '徽商银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["城商行"]', publish_date: '2026-02-20'},
    {title: '广州农商行信用卡被罚180万元', summary: '广州农村商业银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-04-15'},
    {title: '深圳农商行信用卡被罚95万元', summary: '深圳农村商业银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-04-10'},
    {title: '上海农商行信用卡被罚120万元', summary: '上海农村商业银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-03-28'},
    {title: '北京农商行信用卡被罚88万元', summary: '北京农村商业银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-03-20'},
    {title: '东莞农商行信用卡被罚75万元', summary: '东莞农村商业银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-03-12'},
    {title: '重庆农商行信用卡被罚150万元', summary: '重庆农村商业银行因信用卡违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-03-05'},
    {title: '河南农商行信用卡被罚65万元', summary: '河南农村商业银行因信用卡业务违规被处罚', source: '国家金融监督管理总局', url: 'https://www.nfra.gov.cn', category: 'risk', tags: '["农商行"]', publish_date: '2026-02-22'},

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
{title: '交通银行信用卡安全增强系统采购项目', summary: '预算950万元，采购信用卡安全增强系统', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260418_26438001.htm', category: 'bid', tags: '["安全","系统"]', publish_date: '2026-04-18'},
    {title: '民生银行信用卡智能客服升级', summary: '预算1200万元，升级智能客服系统', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260414_26433001.htm', category: 'bid', tags: '["智能客服","AI"]', publish_date: '2026-04-14'},
    {title: '浦发银行信用卡大数据平台', summary: '预算1800万元，建设大数据平台', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202604/t20260408_26423001.htm', category: 'bid', tags: '["大数据","平台"]', publish_date: '2026-04-08'},
    {title: '兴业银行信用卡营销活动服务', summary: '预算600万元，信用卡营销活动服务采购', source: '中国政府采购网', url: 'https://www.ccgp.gov.cn/cggg/zygg/gkzb/202603/t20260330_26396001.htm', category: 'bid', tags: '["营销","服务"]', publish_date: '2026-03-30'},

    {title: '湖南银行2026年信用卡线上营销活动项目', summary: '湖南银行2026年信用卡线上营销活动项目招标，预算193.9万元', source: '湖南银行', url: 'https://www.hunan-bank.com/96599/2026-04/07/article_2026040710591792837.shtml', category: 'bid', tags: '["投标","湖南银行"]', publish_date: '2026-04-07'},
    
    // 修正URL的问题数据
    {title: '湖南省农村信用社联合社2025年基础软硬件维保采购项目', summary: '预算74万元，NBU备份软件原厂维保57万+金蝶天燕WEB中间件及达梦数据库维保17万', source: '湖南省农村信用社', url: 'https://www.hnnxs.com/info/87595.jspx', category: 'bid', tags: '["维保","省联社"]', publish_date: '2026-04-03'},
    {title: '广州农村商业银行2026-2027年信用卡中心服务外包项目', summary: '预算804万元，采购828人月外包服务，涵盖客户服务、催收、营销', source: '广州农商行', url: 'https://newcpm.grcbank.com:8079/jcepp-esp/notice/toNoticeDetails?newsId=99dc858c4b834fcabe86637fd6712153&newsType=02', category: 'bid', tags: '["外包","农商行"]', publish_date: '2026-03-24'},
    
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

                db.run(`DELETE FROM articles WHERE category IN ('news', 'business', 'industry', 'opportunity', 'bid')`, [], function(err) {
                    if (err) console.error('Delete error:', err);
                    else console.log('✅ 已清除旧数据');

                    // 去重：按URL去重，保留第一条
                    const uniqueData = [];
                    const seenUrls = new Set();
                    initialData.forEach(item => {
                        if (!seenUrls.has(item.url)) {
                            seenUrls.add(item.url);
                            uniqueData.push(item);
                        }
                    });
                    console.log(`去重后：${uniqueData.length} 条（原始 ${initialData.length} 条）`);

                    let inserted = 0;
                    const stmt = db.prepare(`INSERT OR REPLACE INTO articles (title, summary, source, url, category, tags, publish_date) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                    
                    uniqueData.forEach(item => {
                        stmt.run(item.title, item.summary, item.source, item.url, item.category, item.tags, item.publish_date, function(err) {
                            if (err) console.error('Insert error:', err);
                            inserted++;
                            if (inserted === uniqueData.length) {
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
