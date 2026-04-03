# 信用卡资讯聚合平台

## 项目结构

```
credit-news-platform/
├── data/
│   ├── schema.sql          # 数据库表结构
│   └── news.db             # SQLite 数据库 (运行时生成)
├── scripts/
│   └── crawler.js          # 自动抓取脚本
├── templates/
│   └── index.html          # 前端页面模板
├── server.js               # 后端 API 服务
└── README.md               # 使用说明
```

## 功能特性

- **自动抓取**: 定时搜索信用卡相关政策、风险、招标资讯
- **分类展示**: 监管政策 / 风险新规 / 招标信息 / 行业资讯
- **搜索筛选**: 支持关键词搜索、时间筛选
- **数据去重**: 自动识别重复内容
- **响应式设计**: 支持桌面端和移动端

## 快速开始

### 1. 安装依赖

```bash
cd credit-news-platform
npm install sqlite3
```

### 2. 初始化数据库

```bash
sqlite3 data/news.db < data/schema.sql
```

### 3. 运行抓取脚本（手动测试）

```bash
node scripts/crawler.js
```

### 4. 启动 Web 服务

```bash
node server.js
```

访问 http://localhost:3000

## 定时任务配置

使用 OpenClaw Cron 每日自动抓取：

```bash
# 添加定时任务
openclaw cron add --name "credit-news-crawler" \
  --schedule "0 9 * * *" \
  --command "node scripts/crawler.js"

# 查看任务列表
openclaw cron list
```

## 搜索关键词配置

编辑 `scripts/crawler.js` 中的 `SEARCH_CONFIG`：

- **监管政策**: 国家金融监督管理总局、央行、银保监会相关政策
- **风险新规**: 信用卡风控、反欺诈、资金安全
- **招标信息**: 信用卡系统采购、项目招标
- **行业资讯**: 市场动态、发卡量报告

## API 接口

### 获取文章列表

```
GET /api/articles?category=policy&page=1&limit=10
```

### 搜索文章

```
GET /api/articles/search?q=关键词
```

### 获取统计

```
GET /api/stats
```

## 技术栈

- **前端**: HTML5 + Tailwind CSS + Vanilla JS
- **后端**: Node.js + Express
- **数据库**: SQLite3
- **搜索**: Kimi Search API
- **定时任务**: OpenClaw Cron

## 注意事项

1. 首次运行需要配置 kimi_search 工具权限
2. 建议设置合理的抓取频率，避免频繁请求
3. 生产环境建议添加用户认证
4. 定期备份 SQLite 数据库