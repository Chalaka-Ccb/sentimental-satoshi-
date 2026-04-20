/**
 * prisma.config.ts
 * Minimal Prisma v7+ config file.
 * Exports a plain object so the file works without extra runtime packages.
 * Keep real credentials in `.env` (do not commit secrets).
 */

import path from 'path';
import { existsSync } from 'fs';
import { config as loadEnv } from 'dotenv';

// Load .env from common parent locations so Prisma CLI picks up DATABASE_URL/DIRECT_URL
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const p of candidates) {
  if (existsSync(p)) {
    loadEnv({ path: p });
    break;
  }
}

const config = {
  datasources: {
    db: {
      provider: "postgresql",
      // Runtime datasource URL for Prisma v7+: used by migrate and the client
      url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    },
  },
  migrate: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
};

export default config;
