#!/usr/bin/env node
/**
 * 城商行和农商行信用卡及外围系统投标信息爬虫配置
 */

// 搜索关键词配置 - 专门针对城商行和农商行信用卡及外围系统
const SEARCH_QUERIES = {
    // 城商行信用卡核心系统
    cityBankCreditCard: [
        "城商行 信用卡 发卡 系统 招标 2026",
        "城商行 信用卡 核心 系统 升级 招标",
        "城商行 贷记卡 系统 建设 招标",
        "城市商业银行 信用卡 系统 采购 招标",
        "城商行 信用卡 平台 开发 招标",
        "城商行 信用卡 系统 改造 招标",
        "城商行 信用卡 系统 运维 招标"
    ],
    // 城商行信用卡外围系统 - 风控类
    cityBankRisk: [
        "城商行 信用卡 风控 系统 招标",
        "城商行 信用卡 反欺诈 系统 招标",
        "城商行 信用卡 信用评分 系统 招标",
        "城商行 信用卡 风险 管理 系统 招标",
        "城商行 信用卡 交易 监控 系统 招标"
    ],
    // 城商行信用卡外围系统 - 营销获客类
    cityBankMarketing: [
        "城商行 信用卡 营销 系统 招标",
        "城商行 信用卡 获客 系统 招标",
        "城商行 信用卡 推广 外包 招标",
        "城商行 信用卡 地推 外包 招标",
        "城商行 信用卡 电销 外包 招标",
        "城商行 信用卡 网销 渠道 招标"
    ],
    // 城商行信用卡外围系统 - 运营服务类
    cityBankOperation: [
        "城商行 信用卡 催收 系统 外包 招标",
        "城商行 信用卡 权益 平台 招标",
        "城商行 信用卡 积分 系统 招标",
        "城商行 信用卡 账单 系统 招标",
        "城商行 信用卡 客服 系统 招标",
        "城商行 信用卡 呼叫中心 外包 招标"
    ],
    // 城商行信用卡外围系统 - 技术支撑类
    cityBankTech: [
        "城商行 信用卡 数据 系统 招标",
        "城商行 信用卡 支付 系统 招标",
        "城商行 信用卡 审批 系统 招标",
        "城商行 信用卡 征信 系统 招标",
        "城商行 信用卡 对账 系统 招标",
        "城商行 信用卡 清分 系统 招标",
        "城商行 信用卡 接口 系统 招标"
    ],
    // 城商行信用卡外围系统 - 增值服务类
    cityBankValueAdded: [
        "城商行 信用卡 APP 开发 招标",
        "城商行 信用卡 小程序 开发 招标",
        "城商行 信用卡 商城 平台 招标",
        "城商行 信用卡 分期 系统 招标",
        "城商行 信用卡 现金贷 系统 招标",
        "城商行 信用卡 场景 金融 招标"
    ],
    // 农商行信用卡核心系统
    ruralBankCreditCard: [
        "农商行 信用卡 发卡 系统 招标 2026",
        "农商行 信用卡 核心 系统 升级 招标",
        "农商行 贷记卡 系统 建设 招标",
        "农村商业银行 信用卡 系统 采购 招标",
        "农商行 信用卡 平台 开发 招标",
        "农商行 信用卡 系统 改造 招标",
        "农商行 信用卡 系统 运维 招标"
    ],
    // 农商行信用卡外围系统 - 风控类
    ruralBankRisk: [
        "农商行 信用卡 风控 系统 招标",
        "农商行 信用卡 反欺诈 系统 招标",
        "农商行 信用卡 信用评分 系统 招标",
        "农商行 信用卡 风险 管理 系统 招标",
        "农商行 信用卡 交易 监控 系统 招标"
    ],
    // 农商行信用卡外围系统 - 营销获客类
    ruralBankMarketing: [
        "农商行 信用卡 营销 系统 招标",
        "农商行 信用卡 获客 系统 招标",
        "农商行 信用卡 推广 外包 招标",
        "农商行 信用卡 地推 外包 招标",
        "农商行 信用卡 电销 外包 招标",
        "农商行 信用卡 网销 渠道 招标"
    ],
    // 农商行信用卡外围系统 - 运营服务类
    ruralBankOperation: [
        "农商行 信用卡 催收 系统 外包 招标",
        "农商行 信用卡 权益 平台 招标",
        "农商行 信用卡 积分 系统 招标",
        "农商行 信用卡 账单 系统 招标",
        "农商行 信用卡 客服 系统 招标",
        "农商行 信用卡 呼叫中心 外包 招标"
    ],
    // 农商行信用卡外围系统 - 技术支撑类
    ruralBankTech: [
        "农商行 信用卡 数据 系统 招标",
        "农商行 信用卡 支付 系统 招标",
        "农商行 信用卡 审批 系统 招标",
        "农商行 信用卡 征信 系统 招标",
        "农商行 信用卡 对账 系统 招标",
        "农商行 信用卡 清分 系统 招标",
        "农商行 信用卡 接口 系统 招标"
    ],
    // 农商行信用卡外围系统 - 增值服务类
    ruralBankValueAdded: [
        "农商行 信用卡 APP 开发 招标",
        "农商行 信用卡 小程序 开发 招标",
        "农商行 信用卡 商城 平台 招标",
        "农商行 信用卡 分期 系统 招标",
        "农商行 信用卡 现金贷 系统 招标",
        "农商行 信用卡 场景 金融 招标"
    ],
    // 省联社信用卡系统
    provincialAssociation: [
        "省联社 信用卡 系统 招标 2026",
        "省联社 贷记卡 系统 建设 招标",
        "农村信用联社 信用卡 系统 采购",
        "省联社 信用卡 平台 开发 招标",
        "省联社 信用卡 系统 升级 招标",
        "省联社 信用卡 系统 维护 招标"
    ],
    // 村镇银行信用卡系统
    villageBank: [
        "村镇银行 信用卡 系统 招标 2026",
        "村镇银行 贷记卡 系统 建设 招标",
        "村镇银行 信用卡 系统 采购 招标"
    ],
    // 民营银行信用卡系统
    privateBank: [
        "民营银行 信用卡 系统 招标 2026",
        "民营银行 贷记卡 系统 建设 招标",
        "民营银行 信用卡 系统 采购 招标"
    ],
    // 信用卡相关系统通用
    creditCardSystems: [
        "城商行 农商行 信用卡 系统 外包",
        "城商行 农商行 信用卡 系统 维护",
        "城商行 农商行 信用卡 系统 升级",
        "城商行 农商行 信用卡 系统 改造",
        "区域性银行 信用卡 系统 招标",
        "中小银行 信用卡 系统 招标"
    ]
};

// 获取所有搜索关键词（扁平化）
function getAllSearchQueries() {
    const queries = [];
    
    Object.values(SEARCH_QUERIES).forEach(category => {
        category.forEach(query => {
            queries.push(query);
        });
    });
    
    return queries;
}

// 根据关键词获取标签
function getTagsForQuery(query) {
    const tags = ['投标'];
    
    // 银行类型
    if (query.includes('城商行') || query.includes('城市商业银行')) {
        tags.push('城商行');
    }
    if (query.includes('农商行') || query.includes('农村商业银行')) {
        tags.push('农商行');
    }
    if (query.includes('省联社') || query.includes('信用联社')) {
        tags.push('省联社');
    }
    if (query.includes('村镇银行')) {
        tags.push('村镇银行');
    }
    if (query.includes('民营银行')) {
        tags.push('民营银行');
    }
    if (query.includes('区域性银行') || query.includes('中小银行')) {
        tags.push('区域性银行');
    }
    
    // 业务类型
    if (query.includes('信用卡') || query.includes('贷记卡')) {
        tags.push('信用卡');
    }
    
    // 系统类型 - 核心系统
    if (query.includes('发卡') || query.includes('核心')) {
        tags.push('核心系统');
    }
    
    // 系统类型 - 风控类
    if (query.includes('风控') || query.includes('风险')) {
        tags.push('风控系统');
    }
    if (query.includes('反欺诈')) {
        tags.push('反欺诈系统');
    }
    if (query.includes('信用评分')) {
        tags.push('信用评分系统');
    }
    if (query.includes('交易监控')) {
        tags.push('交易监控系统');
    }
    
    // 系统类型 - 营销获客类
    if (query.includes('营销')) {
        tags.push('营销系统');
    }
    if (query.includes('获客') || query.includes('推广') || query.includes('地推') || query.includes('网销')) {
        tags.push('获客系统');
    }
    if (query.includes('电销') || query.includes('电话销售')) {
        tags.push('电销外包');
    }
    
    // 系统类型 - 运营服务类
    if (query.includes('催收')) {
        tags.push('催收系统');
    }
    if (query.includes('权益')) {
        tags.push('权益平台');
    }
    if (query.includes('积分')) {
        tags.push('积分系统');
    }
    if (query.includes('账单')) {
        tags.push('账单系统');
    }
    if (query.includes('客服') || query.includes('呼叫')) {
        tags.push('客服系统');
    }
    
    // 系统类型 - 技术支撑类
    if (query.includes('数据')) {
        tags.push('数据系统');
    }
    if (query.includes('支付')) {
        tags.push('支付系统');
    }
    if (query.includes('审批')) {
        tags.push('审批系统');
    }
    if (query.includes('征信')) {
        tags.push('征信系统');
    }
    if (query.includes('对账')) {
        tags.push('对账系统');
    }
    if (query.includes('清分')) {
        tags.push('清分系统');
    }
    if (query.includes('接口')) {
        tags.push('接口系统');
    }
    
    // 系统类型 - 增值服务类
    if (query.includes('APP') || query.includes('小程序')) {
        tags.push('移动端');
    }
    if (query.includes('商城')) {
        tags.push('商城平台');
    }
    if (query.includes('分期')) {
        tags.push('分期系统');
    }
    if (query.includes('现金贷')) {
        tags.push('现金贷系统');
    }
    if (query.includes('场景金融')) {
        tags.push('场景金融');
    }
    
    // 服务类型
    if (query.includes('外包')) {
        tags.push('外包服务');
    }
    if (query.includes('运维') || query.includes('维护')) {
        tags.push('运维服务');
    }
    if (query.includes('升级') || query.includes('改造')) {
        tags.push('升级改造');
    }
    if (query.includes('开发')) {
        tags.push('系统开发');
    }
    
    return tags;
}

module.exports = {
    SEARCH_QUERIES,
    getAllSearchQueries,
    getTagsForQuery
};