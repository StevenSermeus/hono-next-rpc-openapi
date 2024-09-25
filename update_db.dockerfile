FROM --platform=linux/amd64 node:20-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN yarn add prisma

CMD ["yarn", "prisma", "db", "push", "--skip-generate", "--accept-data-loss"]