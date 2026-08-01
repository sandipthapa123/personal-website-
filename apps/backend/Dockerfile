FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/
RUN npm install
RUN npm --workspace=apps/backend run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 4000
CMD ["npm", "--workspace=apps/backend", "run", "start:prod"]
