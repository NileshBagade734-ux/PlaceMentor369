# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
# Copy root package files
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install
# Copy everything from root
COPY . .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/backend/package*.json ./
RUN npm install --omit=dev

# Copy the backend code explicitly from the root
COPY --from=builder /usr/src/app/backend ./
# If your routes/utils/middlewares are at the root, copy them too:
COPY --from=builder /usr/src/app/middlewares ./middlewares
COPY --from=builder /usr/src/app/routes ./routes
COPY --from=builder /usr/src/app/utils ./utils
COPY --from=builder /usr/src/app/workers ./workers

USER node
EXPOSE 5000
CMD ["node", "server.js"]