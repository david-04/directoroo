import { readFileSync, writeFileSync } from "node:fs";

const [, , input, output] = process.argv;
const lines = readFileSync(input, "utf-8").toString().split(/\r?\n/);
const stringified = JSON.stringify(lines, undefined, 4);
writeFileSync(output, `export const SHELL_SCRIPT_TEMPLATE = ${stringified}.join("\\n");\n`);
