# Dockerfile
FROM node:20-slim as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage - using a minimal Debian-based image for Nginx
FROM nginx:1.25-slim

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Remove unnecessary files to minimize attack surface
RUN rm -rf /usr/share/nginx/html/index.html && \
    rm -rf /var/cache/apt/* && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 80

# Run Nginx as non-root user if possible
USER nginx

CMD ["nginx", "-g", "daemon off;"]