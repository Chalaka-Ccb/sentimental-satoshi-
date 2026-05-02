import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load the environment variables
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Uses DIRECT_URL for migrations, falls back to pooled DATABASE_URL
    url: (process.env.DIRECT_URL ?? process.env.DATABASE_URL) as string,
  },
});