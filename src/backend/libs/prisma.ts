import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
const globalWithPrisma = global as typeof globalThis & {
  prisma: PrismaClient;
};
switch (process.env.NODE_ENV) {
  case 'production':
    prisma = new PrismaClient();
    break;
  default:
    if (!globalWithPrisma.prisma) {
      globalWithPrisma.prisma = new PrismaClient({
        log: ['info', 'warn', 'query'],
      });
    }
    prisma = globalWithPrisma.prisma;
}
export default prisma;
