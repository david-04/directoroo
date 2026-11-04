import { getConfig } from "./config/get-config.js";
import { STDIN_OR_STDOUT } from "./config/parse-args.js";
import { loadShortcuts } from "./shortcuts/load-shortcuts.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const config = getConfig(process.argv.slice(2));
const shortcuts = loadShortcuts(config);
const files = config.output.map(({ file, render }) => ({ file, contents: render(config, shortcuts) }) as const);

for (const { file, contents } of files) {
    const normalizedContents = contents.replaceAll("\r", "").replaceAll(/\s$/g, "\n");
    if (STDIN_OR_STDOUT === file) {
        console.log(normalizedContents);
    } else {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, normalizedContents, { encoding: "utf-8" });
    }
}
