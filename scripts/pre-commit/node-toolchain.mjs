#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { createLogger, fileExists, findExistingFiles, runAsHook, runPnpm } from "./lib.mjs";

const TAG = "node-toolchain";
const PACKAGE_MANIFEST_NAME = "package.json";
const LOCKFILE_NAME = "pnpm-lock.yaml";

const FORBIDDEN_LOCKFILES = [
    "package-lock.json",
    "npm-shrinkwrap.json",
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
];

const FORBIDDEN_LINTER_CONFIGS = [
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".eslintrc.yaml",
    ".eslintrc.yml",
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.cjs",
    "eslint.config.ts",
    "eslint.config.mts",
    "eslint.config.cts",
];

export async function runNodeToolchainCheck({ rootDir = process.cwd() } = {}) {
    const log = createLogger(TAG);

    if (!(await fileExists(path.join(rootDir, PACKAGE_MANIFEST_NAME)))) {
        log.info("No package.json; skipping pnpm and oxlint checks.");
        return 0;
    }

    const foreignLockfiles = await findExistingFiles(rootDir, FORBIDDEN_LOCKFILES);
    if (foreignLockfiles.length > 0) {
        log.error(`pnpm is the only allowed package manager. Remove: ${foreignLockfiles.join(", ")}`);
        return 1;
    }

    if (!(await fileExists(path.join(rootDir, LOCKFILE_NAME)))) {
        log.error("package.json exists but pnpm-lock.yaml is missing. Run `pnpm install` and retry.");
        return 1;
    }

    const eslintConfigs = await findExistingFiles(rootDir, FORBIDDEN_LINTER_CONFIGS);
    if (eslintConfigs.length > 0) {
        log.error(`oxlint is the only allowed linter. Remove: ${eslintConfigs.join(", ")}`);
        return 1;
    }

    log.info("Running oxlint.");
    const exitCode = await runPnpm(["exec", "oxlint", "--deny-warnings"], { cwd: rootDir });
    if (exitCode !== 0) {
        log.error("FAILED: oxlint reported issues or is not installed (`pnpm add -D oxlint`).");
        return 1;
    }

    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await runAsHook(TAG, () => runNodeToolchainCheck());
}
