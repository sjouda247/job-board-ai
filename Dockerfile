# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=backend-build /backend/package.json .
COPY --from=backend-build /backend/package-lock.json .
RUN npm ci --omit=dev
COPY --from=backend-build /backend/dist ./dist
COPY --from=frontend-build /frontend/dist ./public
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/tmp/database.sqlite
ENV UPLOAD_DIR=/tmp/uploads
EXPOSE 8080
CMD ["node", "dist/server.js"]
