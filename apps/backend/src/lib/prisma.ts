import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __prismaPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      '[Prisma] DATABASE_URL is not set.\n' +
      'Make sure your .env file exists and contains DATABASE_URL.\n' +
      'See docs/guides/PRISMA_SUPABASE_SETUP.md for the correct format.'
    );
  }

  return new Pool({
    connectionString,
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  });
}

function getPrismaClient(): PrismaClient {
  if (globalThis.__prismaClient) {
    return globalThis.__prismaClient;
  }

  if (!globalThis.__prismaPool) {
    globalThis.__prismaPool = createPool();
  }

  const adapter = new PrismaPg(globalThis.__prismaPool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [{ emit: 'stdout', level: 'error' }],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prismaClient = client;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === '$disconnect') {
      return async () => {
        const client = globalThis.__prismaClient;
        await client?.$disconnect();
        await globalThis.__prismaPool?.end();
      };
    }

    return new Proxy(
      {},
      {
        get(_inner, method) {
          return (...args: unknown[]) =>
            Promise.resolve(getPrismaClient()).then((client) => {
              const target = (client as any)[prop];

              if (typeof target === 'function') {
                return target.apply(client, args);
              }

              if (target && typeof target[method as string] === 'function') {
                return target[method as string](...args);
              }

              return target;
            });
        },
      }
    );
  },
});

export async function getPrisma(): Promise<PrismaClient> {
  return getPrismaClient();
}

process.on('beforeExit', async () => {
  if (globalThis.__prismaClient) {
    await globalThis.__prismaClient.$disconnect().catch(console.error);
  }
  if (globalThis.__prismaPool) {
    await globalThis.__prismaPool.end().catch(console.error);
  }
});
