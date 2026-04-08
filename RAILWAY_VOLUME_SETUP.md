# Railway Volume 配置指南

## 步骤 1: 在 Railway Dashboard 中创建 Volume

1. 访问 https://railway.app/dashboard
2. 进入 `credit-news-platform` 项目
3. 点击左侧菜单 **Volumes**
4. 点击 **New Volume**
5. 配置：
   - **Name**: `data`
   - **Mount Path**: `/data`
   - **Size**: 1GB (足够存储 SQLite 数据库)

## 步骤 2: 配置环境变量

1. 进入项目 Settings → Variables
2. 添加环境变量：
   ```
   RAILWAY_VOLUME_MOUNT_PATH = /data
   ```

## 步骤 3: 重新部署

1. 代码已自动推送到 GitHub
2. Railway 会自动触发新的部署
3. 等待部署完成

## 验证数据持久化

部署完成后，访问你的域名：
```
https://credit-news-platform-production-6acb.up.railway.app
```

检查 API 返回的数据：
```
https://credit-news-platform-production-6acb.up.railway.app/api/stats
```

应该显示：
```json
{
  "total": 15,
  "byCategory": [
    {"category": "bid", "count": 5},
    {"category": "policy", "count": 5},
    {"category": "risk", "count": 5}
  ],
  "today": 15
}
```

## 数据备份（可选）

由于 Volume 中的数据是持久的，但建议定期备份：

```bash
# 在 Railway 控制台中运行
railway connect

# 导出数据库
cat /data/news.db > backup.db
```

## 注意事项

1. **Volume 是持久的**：重新部署不会丢失数据
2. **首次部署**：会自动初始化 15 条示例数据
3. **后续更新**：爬虫抓取的数据会保存在 Volume 中
4. **数据库位置**：
   - 本地开发：`./data/news.db`
   - Railway：`/data/news.db` (Volume 挂载点)

## 故障排除

如果部署后没有数据：
1. 检查 Volume 是否正确挂载到 `/data`
2. 检查环境变量 `RAILWAY_VOLUME_MOUNT_PATH` 是否设置
3. 查看 Railway 部署日志是否有错误
