#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { createLogger, runAsHook } from "./lib.mjs";

const TAG = "line-cap";
const MAX_COUNTED_LINES = 800;
const SOURCE_EXTENSIONS = new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
    ".vue",
    ".py",
]);
const SKIP_DIR_NAMES = new Set([
    "tests",
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".nuxt",
    ".git",
    ".venv",
    "venv",
    "__pycache__",
    "example",
]);

function isPythonPath(filePath) {
    return path.extname(filePath) === ".py";
}

function stripHtmlComments(source) {
    return source.replace(/<!--[\s\S]*?-->/gu, (block) => block.replace(/[^\n]/gu, ""));
}

function stripJsStyleComments(source) {
    let output = "";
    let index = 0;
    let state = "code";

    while (index < source.length) {
        const character = source[index];
        const next = source[index + 1];

        if (state === "code") {
            if (character === "/" && next === "/") {
                state = "line";
                index += 2;
                continue;
            }
            if (character === "/" && next === "*") {
                state = "block";
                index += 2;
                continue;
            }
            if (character === "'") {
                state = "single";
                output += character;
                index += 1;
                continue;
            }
            if (character === '"') {
                state = "double";
                output += character;
                index += 1;
                continue;
            }
            if (character === "`") {
                state = "template";
                output += character;
                index += 1;
                continue;
            }
            output += character;
            index += 1;
            continue;
        }

        if (state === "line") {
            if (character === "\n") {
                state = "code";
                output += character;
            }
            index += 1;
            continue;
        }

        if (state === "block") {
            if (character === "*" && next === "/") {
                state = "code";
                index += 2;
                continue;
            }
            if (character === "\n") {
                output += character;
            }
            index += 1;
            continue;
        }

        output += character;
        if (character === "\\" && index + 1 < source.length) {
            output += source[index + 1];
            index += 2;
            continue;
        }
        if (state === "single" && character === "'") {
            state = "code";
        } else if (state === "double" && character === '"') {
            state = "code";
        } else if (state === "template" && character === "`") {
            state = "code";
        }
        index += 1;
    }

    return output;
}

function countPythonLines(source) {
    let count = 0;
    for (const line of source.split(/\r?\n/u)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        count += 1;
    }
    return count;
}

function countJsFamilyLines(source) {
    const withoutHtml = stripHtmlComments(source);
    const withoutComments = stripJsStyleComments(withoutHtml);
    let count = 0;
    for (const line of withoutComments.split(/\r?\n/u)) {
        if (line.trim()) {
            count += 1;
        }
    }
    return count;
}

function countSourceLines(filePath, source) {
    if (isPythonPath(filePath)) {
        return countPythonLines(source);
    }
    return countJsFamilyLines(source);
}

async function collectSourceFiles(rootDir) {
    const files = [];

    async function walk(directory) {
        const entries = await readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                if (!SKIP_DIR_NAMES.has(entry.name)) {
                    await walk(fullPath);
                }
                continue;
            }
            if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
                files.push(fullPath);
            }
        }
    }

    await walk(rootDir);
    return files.toSorted((left, right) => left.localeCompare(right));
}

export async function runLineCapCheck({ rootDir = process.cwd() } = {}) {
    const log = createLogger(TAG);
    const files = await collectSourceFiles(rootDir);
    const violations = [];

    for (const filePath of files) {
        const source = await readFile(filePath, "utf8");
        const count = countSourceLines(filePath, source);
        if (count > MAX_COUNTED_LINES) {
            violations.push({
                file: path.relative(rootDir, filePath).replaceAll("\\", "/"),
                count,
            });
        }
    }

    if (violations.length > 0) {
        log.error(`Files exceed ${MAX_COUNTED_LINES} counted lines (blanks and comments excluded):`);
        for (const violation of violations) {
            log.error(`- ${violation.file}: ${violation.count}`);
        }
        log.error("Split the file. Do not disable max-lines.");
        return 1;
    }

    log.info(`OK: ${files.length} files, cap ${MAX_COUNTED_LINES} counted lines.`);
    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await runAsHook(TAG, () => runLineCapCheck());
}
