FROM node:18-alpine
RUN apk add --no-cache python3 make g++ bash
WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm ci --production || npm install --production
COPY . .
RUN ls -la
EXPOSE 3000
CMD ["node", "-e", "console.log('start'); require('./server.js')"]