FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/frontend/ ./apps/frontend/
RUN npm install
RUN npm --workspace=apps/frontend run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "--workspace=apps/frontend", "run", "start"]
