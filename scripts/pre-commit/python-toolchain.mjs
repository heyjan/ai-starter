#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { createLogger, fileExists, findExistingFiles, isCommandNotFound, runAsHook, runCommand } from "./lib.mjs";

const TAG = "python-toolchain";
const PROJECT_MANIFEST_NAME = "pyproject.toml";
const LOCKFILE_NAME = "uv.lock";

const FORBIDDEN_PACKAGING_FILES = [
    "requirements.txt",
    "requirements-dev.txt",
    "Pipfile",
    "Pipfile.lock",
    "poetry.lock",
    "pdm.lock",
    "setup.py",
];

const FORBIDDEN_LINTER_CONFIGS = [".flake8", ".isort.cfg", ".pylintrc", "pylintrc"];

const CHECKS = [
    { label: "uv lock --check", args: ["lock", "--check"], hint: "Run `uv lock` and commit uv.lock." },
    {
        label: "ruff check",
        args: ["run", "--frozen", "ruff", "check"],
        hint: "Run `uv run ruff check --fix` (install with `uv add --dev ruff`).",
    },
    {
        label: "ruff format --check",
        args: ["run", "--frozen", "ruff", "format", "--check"],
        hint: "Run `uv run ruff format` (install with `uv add --dev ruff`).",
    },
];

async function runUv(args, options) {
    try {
        return await runCommand("uv", args, options);
    } catch (error) {
        if (isCommandNotFound(error)) {
            throw new Error("uv is not installed. See https://docs.astral.sh/uv/getting-started/installation/", {
                cause: error,
            });
        }
        throw error;
    }
}

export async function runPythonToolchainCheck({ rootDir = process.cwd() } = {}) {
    const log = createLogger(TAG);

    if (!(await fileExists(path.join(rootDir, PROJECT_MANIFEST_NAME)))) {
        log.info("No pyproject.toml; skipping uv and ruff checks.");
        return 0;
    }

    const foreignPackagingFiles = await findExistingFiles(rootDir, FORBIDDEN_PACKAGING_FILES);
    if (foreignPackagingFiles.length > 0) {
        log.error(`uv is the only allowed Python package manager. Remove: ${foreignPackagingFiles.join(", ")}`);
        return 1;
    }

    const foreignLinterConfigs = await findExistingFiles(rootDir, FORBIDDEN_LINTER_CONFIGS);
    if (foreignLinterConfigs.length > 0) {
        log.error(`ruff is the only allowed Python linter and formatter. Remove: ${foreignLinterConfigs.join(", ")}`);
        return 1;
    }

    if (!(await fileExists(path.join(rootDir, LOCKFILE_NAME)))) {
        log.error("pyproject.toml exists but uv.lock is missing. Run `uv lock` and retry.");
        return 1;
    }

    for (const { label, args, hint } of CHECKS) {
        log.info(`Running ${label}.`);
        const exitCode = await runUv(args, { cwd: rootDir });
        if (exitCode !== 0) {
            log.error(`FAILED: ${label}. ${hint}`);
            return 1;
        }
    }

    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await runAsHook(TAG, () => runPythonToolchainCheck());
}
