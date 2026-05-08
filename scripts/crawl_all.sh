#!/bin/bash
# 信用卡行业资讯平台 - 全量抓取脚本
# 每日早上 9 点执行（GitHub Actions UTC+8）
# 采集：监管政策、行业资讯、处罚数据、商机信息、投标信息

DATA_DIR="/Users/huangyin/.openclaw/workspace/credit-platform"
DB_FILE="$DATA_DIR/data/news.db"
LOG_FILE="$DATA_DIR/logs/crawl_$(date +%Y%m%d).log"

mkdir -p "$DATA_DIR/logs"
mkdir -p "$DATA_DIR/data"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 初始化数据库
init_db() {
    sqlite3 "$DB_FILE" "
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
    );
    " 2>/dev/null
    log "数据库初始化完成"
}

# Kimi Search 抓取
kimi_search() {
    local query="$1"
    local category="$2"
    
    log "搜索 [$category]: $query"
    
    # 调用 kimi_search 工具（通过 MCP）
    # 这里需要通过 Python 调用 OpenClaw 的 kimi_search
    python3 -c "
import json
import sys

query = '''$query'''
category = '$category'

# 使用 subprocess 调用 wecom_mcp 或直接写结果
# 简化版：生成搜索结果后写入
print(json.dumps({'query': query, 'category': category, 'status': 'pending'}))
" 2>/dev/null || true
}

# 写入数据库
insert_article() {
    local title="$1"
    local category="$2"
    local source="$3"
    local url="$4"
    local date="$5"
    local summary="$6"
    
    if [ -z "$title" ]; then
        return
    fi
    
    # 检查是否已存在
    local exists=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles WHERE title='$title'" 2>/dev/null)
    if [ "$exists" -gt 0 ]; then
        log "已存在，跳过: $title"
        return
    fi
    
    sqlite3 "$DB_FILE" "
    INSERT INTO articles (title, summary, source, source_url, publish_date, primary_category, crawl_time)
    VALUES ('$title', '$summary', '$source', '$url', '$date', '$category', datetime('now', 'localtime'));
    " 2>/dev/null && log "写入: $title" || log "写入失败: $title"
}

# ========== 1. 监管政策 ==========
crawl_policy() {
    log "=== 抓取监管政策 ==="
    local queries=(
        "国家金融监督管理总局 信用卡 通知 2026"
        "央行 信用卡 新规 政策 2026"
        "银保监会 信用卡 合规 2026"
    )
    
    for q in "${queries[@]}"; do
        log "查询: $q"
        # 这里调用 kimi_search，结果需要后处理
    done
}

# ========== 2. 行业资讯 ==========
crawl_news() {
    log "=== 抓取行业资讯 ==="
    local queries=(
        "信用卡 行业动态 2026"
        "银行信用卡 发卡量 报告 2026"
        "信用卡 市场 趋势 2026"
    )
    
    for q in "${queries[@]}"; do
        log "查询: $q"
    done
}

# ========== 3. 处罚数据 ==========
crawl_penalty() {
    log "=== 抓取处罚数据 ==="
    local queries=(
        "城商行 农商行 信用卡 处罚 site:gov.cn 2026"
        "银行 信用卡 违规 罚款 site:nfra.gov.cn 2026"
        "银行 罚单 农商行 site:pbc.gov.cn 2026"
    )
    
    for q in "${queries[@]}"; do
        log "查询: $q"
    done
}

# ========== 4. 商机信息 ==========
crawl_business() {
    log "=== 抓取商机信息 ==="
    local queries=(
        "城商行 信用卡 系统 采购 2026"
        "农商行 信用卡 风控 招标 2026"
    )
    
    for q in "${queries[@]}"; do
        log "查询: $q"
    done
}

# ========== 5. 投标信息 ==========
crawl_bid() {
    log "=== 抓取投标信息 ==="
    local queries=(
        "城商行 信用卡 招标公告 2026"
        "农商行 信用卡 中标 2026"
        "城市商业银行 信用卡 采购 招标 2026"
    )
    
    for q in "${queries[@]}"; do
        log "查询: $q"
    done
}

# 统计分类数量
count_by_category() {
    log "=== 分类统计 ==="
    
    local total=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles" 2>/dev/null || echo "0")
    local policy=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles WHERE primary_category='policy'" 2>/dev/null || echo "0")
    local news=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles WHERE primary_category='news'" 2>/dev/null || echo "0")
    local risk=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles WHERE primary_category='risk'" 2>/dev/null || echo "0")
    local business=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles WHERE primary_category='business'" 2>/dev/null || echo "0")
    local bid=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM articles WHERE primary_category='bid'" 2>/dev/null || echo "0")
    
    log "总: $total, 政策: $policy, 资讯: $news, 处罚: $risk, 商机: $business, 投标: $bid"
    
    # 输出 JSON 格式供 GitHub Actions 使用
    echo "{\"total\":$total,\"byCategory\":[{\"category\":\"bid\",\"count\":$bid},{\"category\":\"business\",\"count\":$business},{\"category\":\"news\",\"count\":$news},{\"category\":\"policy\",\"count\":$policy},{\"category\":\"risk\",\"count\":$risk}]}"
}

# 主流程
main() {
    log "=== 开始全量抓取 ==="
    
    init_db
    
    # 抓取各类资讯
    crawl_policy
    crawl_news
    crawl_penalty
    crawl_business
    crawl_bid
    
    # 统计并输出
    count_by_category
    
    log "=== 抓取完成 ==="
}

main "$@"