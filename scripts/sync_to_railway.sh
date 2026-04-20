#!/bin/bash
# 同步本地数据库到Railway平台

echo "=========================================="
echo "同步信用卡资讯平台数据到Railway"
echo "=========================================="
echo ""

# 检查railway CLI是否安装
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安装"
    echo "请先安装: npm install -g @railway/cli"
    echo "然后登录: railway login"
    exit 1
fi

echo "✅ Railway CLI 已安装"
echo ""

# 进入项目目录
cd /Users/huangyin/.openclaw/workspace/credit-news-platform

echo "📦 项目目录: $(pwd)"
echo ""

# 显示当前数据库状态
echo "📊 本地数据库统计:"
sqlite3 data/news.db "SELECT category, COUNT(*) as count FROM articles WHERE publish_date >= '2026-01-01' GROUP BY category;"
echo ""

# 提交并推送更改
echo "🚀 准备部署到Railway..."
echo ""

# 添加数据库文件到git（如果尚未添加）
git add data/news.db

# 提交更改
git commit -m "Update: 添加2026年1-4月信用卡数据
- 监管政策: 1条（辟谣2026年逾期新规谣言）
- 行业资讯: 3条（停发潮、发卡量下滑、渠道收缩）
- 处罚数据: 5条（建行、中信、厦门农商行等）
- 投标信息: 5条（湖南银行、邮储、中信、恒丰、建行河南）
- 总计新增: 14条数据"

# 推送到Railway
echo "正在推送到Railway..."
git push railway main

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 平台地址: https://credit-news-platform-production-6acb.up.railway.app"
echo ""
echo "请等待1-2分钟让服务重启，然后刷新页面查看更新。"
