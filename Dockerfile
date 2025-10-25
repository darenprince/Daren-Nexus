# Stage 1: Build the frontend
FROM node:20 AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the backend
FROM node:20 AS backend-build
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Stage 3: Create the final image
FROM node:20-alpine
WORKDIR /app
# Copy backend build, node_modules and package.json
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/package.json ./package.json

# Copy frontend build
COPY --from=frontend-build /app/dist ./public

EXPOSE 8080
CMD ["node", "dist/index.js"]
