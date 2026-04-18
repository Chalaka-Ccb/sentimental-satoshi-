/**
 * prisma.config.ts
 * Minimal Prisma v7+ config file.
 * Exports a plain object so the file works without extra runtime packages.
 * Keep real credentials in `.env` (do not commit secrets).
 */

const config = {
  datasources: {
    db: {
      provider: "postgresql",
    },
  },
  migrate: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
};

export default config;
