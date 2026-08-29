import "server-only";

import { PGlite } from "@electric-sql/pglite";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPGlite } from "pglite-prisma-adapter";

import { PrismaClient } from "../../../../generated/prisma/client";
import { parseServerEnvironment } from "./environment";

const globalForPrisma = globalThis as unknown as {
  embeddedDatabase: PGlite | undefined;
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const { DATABASE_URL } = parseServerEnvironment(process.env);
  if (process.env.MARKETLENS_RUNTIME === "embedded") {
    const dataDirectory = process.env.MARKETLENS_DATA_DIRECTORY;
    if (!dataDirectory) {
      throw new Error(
        "MARKETLENS_DATA_DIRECTORY is required for the embedded local runtime.",
      );
    }

    const database =
      globalForPrisma.embeddedDatabase ?? new PGlite(dataDirectory);
    globalForPrisma.embeddedDatabase = database;
    return new PrismaClient({
      adapter: new PrismaPGlite(
        database as unknown as ConstructorParameters<typeof PrismaPGlite>[0],
      ),
    });
  }
  const adapter = new PrismaPg({ connectionString: DATABASE_URL });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
