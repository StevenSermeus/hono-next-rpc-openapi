##### DEPENDENCIES

FROM --platform=linux/amd64 node:20-alpine AS deps
# RUN apt install --no-cache libc6-compat openssl
WORKDIR /app

ENV YARN_CACHE_FOLDER /app/.yarn-cache

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### BUILDER

FROM --platform=linux/amd64 node:20-alpine AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV BUILD=true

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### RUNNER

FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV YARN_CACHE_FOLDER /app/.yarn-cache

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Needed for argon2 because it's build on the fly with node-gyp therefore we need the node_modules
COPY --from=deps /app/node_modules/argon2 ./node_modules/argon2

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN apk add --no-cache curl

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node","server.js"]