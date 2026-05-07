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

# 搜索处罚数据的函数
search_penalty() {
    local query="$1"
    log "搜索: $query"
    
    # 使用 curl 调用 Kimi Search API
    # 这里需要先配置 KIMI_API_KEY
    if [ -z "$KIMI_API_KEY" ]; then
        log "未配置 KIMI_API_KEY，跳过"
        return 1
    fi
    
    local response=$(curl -s -X POST 'https://api.moonshot.cn/v1/search' \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $KIMI_API_KEY" \
        -d "{\"query\": \"$query\", \"count\": 10}")
    
    if [ -n "$response" ]; then
        log "获取到数据: ${response:0:100}..."
    fi
}

# 搜索关键词
SEARCH_QUERIES=(
    "城商行 农商行 信用卡 处罚 罚单 2026年"
    "银行 信用卡 违规 罚款 监管总局 2026"
)

# 执行搜索
for query in "${SEARCH_QUERIES[@]}"; do
    search_penalty "$query"
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