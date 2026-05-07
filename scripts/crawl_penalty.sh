#!/bin/bash
# 信用卡行业资讯平台 - 自动抓取处罚数据
# 每日上午9点执行

DATA_DIR="/Users/huangyin/.openclaw/workspace/credit-platform"
DB_FILE="$DATA_DIR/data/news.db"
LOG_FILE="$DATA_DIR/logs/crawl_$(date +%Y%m%d).log"

mkdir -p "$DATA_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== 开始抓取处罚数据 ==="

# 检查 Kimi API Key
if [ -z "$KIMI_PLUGIN_API_KEY" ]; then
    log "未配置 KIMI_PLUGIN_API_KEY，使用 kimi_search 工具"
    USE_TOOL=1
else
    log "已配置 KIMI_PLUGIN_API_KEY"
    USE_TOOL=0
fi

# 搜索关键词列表
SEARCH_QUERIES=(
    "城商行 农商行 2026年 信用卡 处罚 site:gov.cn"
    "银行 2026年 信用卡 违规 罚款 site:nfra.gov.cn"
    "2026年 银行 罚单 农商行 site:pbc.gov.cn"
)

# 手动抓取函数（使用 kimi_search 工具）
manual_crawl() {
    log "手动抓取模式"
    
    # 这里通过调用 kim i_search 获取数据
    # 结果需要手动整理后写入数据库
    log "请使用 kimi_search 搜索后手动写入"
}

# 自动抓取函数（通过API）
auto_crawl() {
    local query="$1"
    log "搜索: $query"
    
    local response=$(curl -s -X POST 'https://api.moonshot.cn/v1/search' \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $KIMI_PLUGIN_API_KEY" \
        -d "{\"query\": \"$query\", \"count\": 15}")
    
    if [ -n "$response" ]; then
        log "获取到数据: ${response:0:200}..."
        # 解析并写入数据库
        echo "$response" | jq -r '.results[] | select(.title != null) | @json' 2>/dev/null || true
    fi
}

# 写入数据库函数
insert_penalty() {
    local title="$1"
    local amount="$2"
    local bank="$3"
    local date="$4"
    local reason="$5"
    local authority="$6"
    
    if [ -z "$title" ]; then
        return
    fi
    
    log "写入: $title"
    
    sqlite3 "$DB_FILE" "
    INSERT INTO articles (title, summary, full_content, source, source_url, publish_date, category, penalized_institution, bank_type, penalty_authority, penalty_amount, penalty_reason) VALUES 
    ('$title', '抓取数据', '抓取数据', 'Kimi Search', 'N/A', '$date', 'risk', '$bank', '待确认', '$authority', $amount, '$reason');
    " 2>/dev/null || log "写入失败或已存在"
}

# 搜索处罚数据
for query in "${SEARCH_QUERIES[@]}"; do
    if [ $USE_TOOL -eq 1 ]; then
        manual_crawl
    else
        auto_crawl "$query"
    fi
done

# 推送到 GitHub
push_to_github() {
    cd "$DATA_DIR"
    
    if git diff --quiet data/news.db 2>/dev/null; then
        log "数据库无变化，跳过推送"
        return
    fi
    
    git add data/
    git commit -m "feat: 自动更新处罚数据 $(date '+%Y-%m-%d')" || true
    git push origin main >> "$LOG_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        log "推送成功"
    else
        log "推送失败"
    fi
}

push_to_github

log "=== 抓取完成 ==="
log "提示: 当前需要手动通过 kimi_search 搜索后写入数据库"