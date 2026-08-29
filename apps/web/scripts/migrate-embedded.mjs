import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";

const scriptDirectory = resolve(dirname(fileURLToPath(import.meta.url)));
const projectDirectory = resolve(scriptDirectory, "../../..");
const migrationsDirectory = join(projectDirectory, "prisma", "migrations");

export async function migrateEmbeddedDatabase(dataDirectory) {
  if (!dataDirectory) {
    throw new Error(
      "MARKETLENS_DATA_DIRECTORY is required for the embedded database.",
    );
  }

  const database = new PGlite(dataDirectory);
  await database.waitReady;

  try {
    await database.exec(`
      CREATE TABLE IF NOT EXISTS "_marketlens_embedded_migrations" (
        "name" TEXT PRIMARY KEY,
        "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrations = (
      await readdir(migrationsDirectory, {
        withFileTypes: true,
      })
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const migration of migrations) {
      const applied = await database.query(
        'SELECT "name" FROM "_marketlens_embedded_migrations" WHERE "name" = $1',
        [migration],
      );
      if (applied.rows.length > 0) continue;

      const sql = await readFile(
        join(migrationsDirectory, migration, "migration.sql"),
        "utf8",
      );
      await database.transaction(async (transaction) => {
        await transaction.exec(sql);
        await transaction.query(
          'INSERT INTO "_marketlens_embedded_migrations" ("name") VALUES ($1)',
          [migration],
        );
      });
    }
  } finally {
    await database.close();
  }
}

if (import.meta.main) {
  migrateEmbeddedDatabase(process.env.MARKETLENS_DATA_DIRECTORY).then(() => {
    console.log("Embedded MarketLens database is ready.");
  });
}

function dirname(path) {
  return path.slice(0, Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")));
}
