# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve concurrently

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend-dist
COPY --from=backend-builder /app/backend/node_modules ./backend-dist/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend-dist/

ENV NODE_ENV=production
ENV DEMO_MODE=true
ENV PORT=3030
EXPOSE 3030

# Backend on 3001 internal, frontend served on 3030
CMD ["sh", "-c", "cd backend-dist && DEMO_MODE=true node server.js & serve -s /app/frontend-dist -l 3030"]
