# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

COPY . .
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM nginx:alpine AS production

RUN apk add --no-cache curl

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure files are readable
RUN chmod -R a+r /usr/share/nginx/html

# Keep default nginx user (root) to avoid permission issues during startup
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
