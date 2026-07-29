import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(root, path), "utf8");
}

describe("deployment readiness configuration", () => {
  it("keeps local Supabase auth and storage aligned with access requests and receipts", () => {
    const config = readRepositoryFile("infra/supabase/config.toml");

    expect(config).toMatch(/\[storage\]\s+enabled = true/i);
    expect(config).toMatch(/\[auth\][\s\S]*enable_signup = true/i);
    expect(config).toMatch(/\[auth\.email\][\s\S]*enable_signup = true/i);
  });

  it("documents the receipt storage bucket required by procurement", () => {
    const deploymentRunbook = readRepositoryFile("docs/DEPLOYMENT.md");
    const procurementMigration = readRepositoryFile(
      "infra/supabase/migrations/20260728000100_add_procurement_setup.sql"
    );

    expect(procurementMigration).toMatch(/'purchase-receipts'/i);
    expect(deploymentRunbook).toMatch(/purchase-receipts/i);
    expect(deploymentRunbook).toMatch(/Supabase Storage/i);
  });

  it("keeps the application shell installable on iOS and Android", () => {
    const index = readRepositoryFile("apps/web/index.html");
    const viteConfig = readRepositoryFile("apps/web/vite.config.ts");

    expect(index).toMatch(/mobile-web-app-capable/i);
    expect(index).toMatch(/apple-mobile-web-app-capable/i);
    expect(index).toMatch(/apple-touch-icon/i);
    expect(viteConfig).toMatch(/display:\s*"standalone"/i);
    expect(viteConfig).toMatch(/manifest/i);
  });
});
