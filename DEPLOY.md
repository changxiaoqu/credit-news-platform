# 部署指南

## 方案一：Railway（推荐，免费）

### 1. 注册账号
- 访问 https://railway.app
- 用 GitHub 账号登录

### 2. 创建项目
```bash
# 进入项目目录
cd credit-news-platform

# 初始化 git
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
gh repo create credit-news-platform --public
git push -u origin main
```

### 3. Railway 部署
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 创建项目
railway init

# 部署
railway up
```

### 4. 配置环境变量
在 Railway Dashboard 设置：
- `PORT=3000`
- `NODE_ENV=production`

### 5. 绑定域名（可选）
在 Railway Dashboard → Settings → Domains 添加自定义域名

---

## 方案二：Render（免费）

### 1. 准备代码
确保项目已推送到 GitHub

### 2. Render 部署
1. 访问 https://render.com
2. 用 GitHub 登录
3. New → Web Service
4. 选择 GitHub 仓库
5. 配置：
   - Build Command: `npm install`
   - Start Command: `npm start`
6. 点击 Deploy

---

## 方案三：Vercel（静态页面）

如果只需要前端展示，无需后端：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd templates
vercel
```

---

## 方案四：国内服务器（阿里云/腾讯云）

### 1. 购买服务器
- 推荐：阿里云 ECS 或腾讯云 CVM
- 配置：1核2G 足够
- 系统：Ubuntu 22.04

### 2. 服务器配置
```bash
# 连接服务器
ssh root@your-server-ip

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 克隆代码
git clone https://github.com/yourname/credit-news-platform.git
cd credit-news-platform
npm install

# 启动服务
pm2 start server.js --name credit-news
pm2 save
pm2 startup
```

### 3. 配置 Nginx
```bash
sudo apt install nginx

# 编辑配置
sudo nano /etc/nginx/sites-available/credit-news
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/credit-news /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 定时任务配置

### Railway/Render
使用 OpenClaw Cron 调用外部 HTTP 触发：

```javascript
// 在 server.js 中添加触发接口
app.post('/api/trigger-crawler', (req, res) => {
    const { secret } = req.body;
    if (secret !== process.env.CRAWLER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // 执行抓取
    require('./scripts/crawler');
    res.json({ success: true });
});
```

然后配置 OpenClaw Cron：
```bash
openclaw cron add \
  --name "credit-news-crawler" \
  --schedule "0 9 * * *" \
  --command "curl -X POST https://your-app.com/api/trigger-crawler -H 'Content-Type: application/json' -d '{\"secret\":\"your-secret\"}'"
```

### 国内服务器
直接使用服务器 cron：
```bash
# 编辑 crontab
crontab -e

# 添加定时任务
0 9 * * * cd /path/to/credit-news-platform && node scripts/crawler.js >> logs/crawler.log 2>&1
```

---

## 环境变量配置

创建 `.env` 文件：
```env
PORT=3000
NODE_ENV=production
DB_PATH=./data/news.db
CRAWLER_SECRET=your-random-secret
```

---

## 推荐选择

| 场景 | 推荐方案 |
|------|---------|
| 快速验证/小团队 | Railway (免费) |
| 国内访问/企业使用 | 阿里云/腾讯云 |
| 纯静态展示 | Vercel (免费) |

需要我帮你配置哪个方案？