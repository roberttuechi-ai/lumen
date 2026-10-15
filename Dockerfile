# Lumen – Alternative zu Render (Railway, Fly.io, eigener Server)
FROM node:20-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY public ./public
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:${PORT}/healthz || exit 1
CMD ["node", "server.js"]
