FROM node:22-alpine
WORKDIR /app
# 先复制 package.json，利用 Docker 缓存层
COPY package*.json ./
RUN npm install --omit=dev
# 再复制源代码
COPY server.js .
COPY templates/ ./templates/
COPY scripts/ ./scripts/
EXPOSE 3000
CMD ["node", "server.js"]
