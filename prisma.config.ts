import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js と同じ優先順位: .env.local > .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
