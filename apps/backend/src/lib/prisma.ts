import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const envCandidates = [
	path.resolve(process.cwd(), '.env'),
	path.resolve(process.cwd(), 'apps/backend/.env'),
	path.resolve(__dirname, '../../.env'),
];

for (const envPath of envCandidates) {
	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
		break;
	}
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('Missing DATABASE_URL environment variable');
}

const localPool = new Pool({ connectionString });

declare global {
	
	var __prismaPool: Pool | undefined;
	var __prismaClient: PrismaClient | undefined;
}

if (!global.__prismaPool) global.__prismaPool = localPool;

const adapter = new PrismaPg(global.__prismaPool as Pool);

if (!global.__prismaClient) {
	global.__prismaClient = new PrismaClient({ adapter });
}

export const getPrisma = async (): Promise<PrismaClient> => {
	return global.__prismaClient as PrismaClient;
};

export const prisma = global.__prismaClient as PrismaClient;