FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --prefer-offline
COPY server.js .
COPY templates/ templates/
COPY scripts/ scripts/
EXPOSE 3000
CMD ["node", "server.js"]
