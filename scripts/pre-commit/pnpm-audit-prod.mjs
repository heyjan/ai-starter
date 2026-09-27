#!/usr/bin/env node

/**
 * Production dependency audit for the pre-commit hook.
 *
 * What this does:
 * 1. Skip when there is no `package.json` (this template is not a Node app yet).
 * 2. Fail when `package.json` exists but `pnpm-lock.yaml` is missing.
 * 3. Run `pnpm audit --prod` and fail on high or critical advisories.
 *
 */

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { fileExists, runAsHook, runPnpm } from "./lib.mjs";

const TAG = "pnpm-audit-prod";
const MIN_SEVERITY = "high";
const LOCKFILE_NAME = "pnpm-lock.yaml";
const PACKAGE_MANIFEST_NAME = "package.json";

/**
 * Audits production dependencies and returns a git-hook exit code.
 *
 * @param {{ rootDir?: string }} [options]
 * @returns {Promise<number>} 0 when clear or skipped; 1 when findings or errors
 */
export async function runPnpmAuditProd({ rootDir = process.cwd() } = {}) {
    const packageJsonPath = path.join(rootDir, PACKAGE_MANIFEST_NAME);
    const lockfilePath = path.join(rootDir, LOCKFILE_NAME);

    if (!(await fileExists(packageJsonPath))) {
        process.stdout.write(
            "[pnpm-audit-prod] No package.json; skipping production dependency audit.\n",
        );
        return 0;
    }

    if (!(await fileExists(lockfilePath))) {
        process.stderr.write(
            "[pnpm-audit-prod] package.json exists but pnpm-lock.yaml is missing. Run `pnpm install` and retry.\n",
        );
        return 1;
    }

    process.stdout.write(
        `[pnpm-audit-prod] Auditing production dependencies (fail on ${MIN_SEVERITY}+).\n`,
    );

    const exitCode = await runPnpm(["audit", "--prod", `--audit-level=${MIN_SEVERITY}`], { cwd: rootDir });
    if (exitCode !== 0) {
        process.stderr.write("[pnpm-audit-prod] FAILED: production audit reported issues.\n");
    }

    return exitCode === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await runAsHook(TAG, () => runPnpmAuditProd());
}
