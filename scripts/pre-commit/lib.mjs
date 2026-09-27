import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export async function fileExists(filePath) {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function findExistingFiles(rootDir, fileNames) {
    const checks = await Promise.all(
        fileNames.map(async (fileName) => ((await fileExists(path.join(rootDir, fileName))) ? fileName : null)),
    );
    return checks.filter((fileName) => fileName !== null);
}

export function runCommand(command, args, { cwd = process.cwd() } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd, stdio: "inherit" });
        child.on("error", reject);
        child.on("close", (code) => {
            resolve(code ?? 1);
        });
    });
}

export function isCommandNotFound(error) {
    return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

export async function runPnpm(args, options) {
    try {
        return await runCommand("pnpm", args, options);
    } catch (error) {
        if (isCommandNotFound(error)) {
            return runCommand("corepack", ["pnpm", ...args], options);
        }
        throw error;
    }
}

export function createLogger(tag) {
    return {
        info: (message) => process.stdout.write(`[${tag}] ${message}\n`),
        error: (message) => process.stderr.write(`[${tag}] ${message}\n`),
    };
}

export async function runAsHook(tag, check) {
    try {
        process.exitCode = await check();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        createLogger(tag).error(message);
        process.exitCode = 1;
    }
}
