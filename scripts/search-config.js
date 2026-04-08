#!/usr/bin/env node
/**
 * 城商行和农商行信用卡及外围系统投标信息爬虫配置
 */

// 搜索关键词配置 - 专门针对城商行和农商行信用卡及外围系统
const SEARCH_QUERIES = {
    // 城商行信用卡系统
    cityBankCreditCard: [
        "城商行 信用卡 发卡 系统 招标 2026",
        "城商行 信用卡 核心 系统 升级 招标",
        "城商行 贷记卡 系统 建设 招标",
        "城市商业银行 信用卡 系统 采购 招标",
        "城商行 信用卡 平台 开发 招标"
    ],
    // 城商行信用卡外围系统
    cityBankPeripheral: [
        "城商行 信用卡 风控 系统 招标",
        "城商行 信用卡 营销 系统 招标",
        "城商行 信用卡 催收 系统 外包 招标",
        "城商行 信用卡 权益 平台 招标",
        "城商行 信用卡 数据 系统 招标",
        "城商行 信用卡 支付 系统 招标",
        "城商行 信用卡 审批 系统 招标",
        "城商行 信用卡 客服 系统 招标",
        "城商行 信用卡 账单 系统 招标",
        "城商行 信用卡 积分 系统 招标"
    ],
    // 农商行信用卡系统
    ruralBankCreditCard: [
        "农商行 信用卡 发卡 系统 招标 2026",
        "农商行 信用卡 核心 系统 升级 招标",
        "农商行 贷记卡 系统 建设 招标",
        "农村商业银行 信用卡 系统 采购 招标",
        "农商行 信用卡 平台 开发 招标"
    ],
    // 农商行信用卡外围系统
    ruralBankPeripheral: [
        "农商行 信用卡 风控 系统 招标",
        "农商行 信用卡 营销 系统 招标",
        "农商行 信用卡 催收 系统 外包 招标",
        "农商行 信用卡 权益 平台 招标",
        "农商行 信用卡 数据 系统 招标",
        "农商行 信用卡 支付 系统 招标",
        "农商行 信用卡 审批 系统 招标",
        "农商行 信用卡 客服 系统 招标",
        "农商行 信用卡 账单 系统 招标",
        "农商行 信用卡 积分 系统 招标"
    ],
    // 省联社信用卡系统
    provincialAssociation: [
        "省联社 信用卡 系统 招标 2026",
        "省联社 贷记卡 系统 建设 招标",
        "农村信用联社 信用卡 系统 采购",
        "省联社 信用卡 平台 开发 招标"
    ],
    // 村镇银行信用卡系统
    villageBank: [
        "村镇银行 信用卡 系统 招标 2026",
        "村镇银行 贷记卡 系统 建设 招标"
    ],
    // 信用卡相关系统通用
    creditCardSystems: [
        "城商行 农商行 信用卡 系统 外包",
        "城商行 农商行 信用卡 系统 维护",
        "城商行 农商行 信用卡 系统 升级",
        "城商行 农商行 信用卡 系统 改造"
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
    if (query.includes('信用卡') || query.includes('贷记卡')) {
        tags.push('信用卡');
    }
    if (query.includes('发卡') || query.includes('核心')) {
        tags.push('核心系统');
    }
    if (query.includes('风控')) {
        tags.push('风控系统');
    }
    if (query.includes('营销')) {
        tags.push('营销系统');
    }
    if (query.includes('催收')) {
        tags.push('催收系统');
    }
    if (query.includes('权益')) {
        tags.push('权益平台');
    }
    if (query.includes('数据')) {
        tags.push('数据系统');
    }
    if (query.includes('支付')) {
        tags.push('支付系统');
    }
    if (query.includes('审批')) {
        tags.push('审批系统');
    }
    if (query.includes('客服')) {
        tags.push('客服系统');
    }
    if (query.includes('账单')) {
        tags.push('账单系统');
    }
    if (query.includes('积分')) {
        tags.push('积分系统');
    }
    
    return tags;
}

module.exports = {
    SEARCH_QUERIES,
    getAllSearchQueries,
    getTagsForQuery
};