#!/usr/bin/env python3
# 信用卡行业资讯平台 - 数据抓取模块
# 负责调用 Kimi Search 并解析结果

import json
import os
import sqlite3
from datetime import datetime

# 数据库路径
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'news.db')

# 搜索关键词配置
SEARCH_QUERIES = {
    'policy': [
        '国家金融监督管理总局 信用卡 通知 2026',
        '央行 信用卡 新规 政策 2026',
        '银保监会 信用卡 合规 2026',
    ],
    'news': [
        '信用卡 行业动态 2026',
        '银行信用卡 发卡量 报告 2026',
        '信用卡 市场 趋势 2026',
    ],
    'risk': [
        '城商行 农商行 信用卡 处罚 site:gov.cn 2026',
        '银行 信用卡 违规 罚款 site:nfra.gov.cn 2026',
        '银行 罚单 农商行 site:pbc.gov.cn 2026',
    ],
    'business': [
        '城商行 信用卡 系统 采购 2026',
        '农商行 信用卡 风控 招标 2026',
    ],
    'bid': [
        '城商行 信用卡 招标公告 2026',
        '农商行 信用卡 中标 2026',
        '城市商业银行 信用卡 采购 招标 2026',
    ],
}

def get_db():
    """获取数据库连接"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化数据库表"""
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            summary TEXT,
            full_content TEXT,
            source TEXT,
            source_url TEXT,
            publish_date TEXT,
            crawl_time TEXT DEFAULT CURRENT_TIMESTAMP,
            primary_category TEXT,
            related_banks TEXT,
            is_duplicate INTEGER DEFAULT 0,
            duplicate_sources TEXT,
            penalized_institution TEXT,
            bank_type TEXT,
            penalty_authority TEXT,
            penalty_amount REAL,
            penalty_reason TEXT,
            penalty_document_no TEXT,
            project_name TEXT,
            procuring_entity TEXT,
            budget TEXT,
            bid_deadline TEXT,
            bid_status TEXT,
            winner TEXT,
            winner_amount TEXT,
            policy_no TEXT,
            issuing_authority TEXT,
            policy_level TEXT,
            is_key_policy INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def insert_article(article):
    """插入文章"""
    conn = get_db()
    
    # 检查是否已存在
    exists = conn.execute(
        'SELECT COUNT(*) FROM articles WHERE title = ?',
        (article.get('title'),)
    ).fetchone()[0]
    
    if exists > 0:
        conn.close()
        return False
    
    conn.execute('''
        INSERT INTO articles (
            title, summary, source, source_url, publish_date, 
            primary_category, crawl_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        article.get('title'),
        article.get('summary'),
        article.get('source'),
        article.get('source_url'),
        article.get('publish_date'),
        article.get('primary_category'),
        datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    ))
    conn.commit()
    conn.close()
    return True

def count_by_category():
    """统计分类数量"""
    conn = get_db()
    
    categories = ['policy', 'news', 'risk', 'business', 'bid']
    result = {'total': 0, 'byCategory': []}
    
    for cat in categories:
        count = conn.execute(
            f"SELECT COUNT(*) FROM articles WHERE primary_category=?",
            (cat,)
        ).fetchone()[0]
        result['byCategory'].append({'category': cat, 'count': count})
        result['total'] += count
    
    conn.close()
    return result

def format_for_feishu(stats):
    """格式化简报发送"""
    lines = ["🤖 每日市场资讯简报\n"]
    lines.append(f"📊 今日共 {stats['total']} 条资讯，分部如下：\n")
    
    cat_names = {
        'policy': '政策法规',
        'news': '行业资讯',
        'risk': '处罚数据',
        'business': '商机信息',
        'bid': '投标信息'
    }
    
    for item in stats['byCategory']:
        cat = item['category']
        count = item['count']
        name = cat_names.get(cat, cat)
        lines.append(f"- {name}：{count} 条\n")
    
    return ''.join(lines)

if __name__ == '__main__':
    # 测试用
    init_db()
    stats = count_by_category()
    print(json.dumps(stats, ensure_ascii=False))
    print('\n')
    print(format_for_feishu(stats))