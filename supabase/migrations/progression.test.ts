import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDirectory = resolve(process.cwd(), "supabase/migrations");

describe("chapter progression migrations", () => {
  it("blocks flag submissions when the immediately preceding chapter is incomplete", () => {
    const rpcMigration = readFileSync(resolve(migrationsDirectory, "0002_submit_flag_rpc.sql"), "utf8");

    expect(rpcMigration).toContain("previous_chapter");
    expect(rpcMigration).toContain("กรุณาทำภารกิจในบทก่อนหน้าให้ครบก่อน");
  });

  it("includes a corrective migration for already deployed submit_flag functions", () => {
    const migrationNames = readdirSync(migrationsDirectory);

    expect(migrationNames.some((name) => name.includes("enforce_chapter_progression"))).toBe(true);
  });
});
