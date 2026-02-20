import { config } from "dotenv";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";
config();
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx node prisma/seed.ts",
  },
  datasource: {
    url: env("prisma_olimp_PRISMA_DATABASE_URL"),
  },
});
