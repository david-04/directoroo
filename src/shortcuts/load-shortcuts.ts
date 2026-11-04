import { STDIN_OR_STDOUT } from "../config/parse-args.js";
import { Config } from "../types/config.js";
import { Shortcut, Shortcuts } from "../types/shortcuts.js";
import { ParsedLine, parseLine } from "./parse-line.js";
import { fail } from "@david-04/typefinity-cli";
import { readFileSync } from "node:fs";

//----------------------------------------------------------------------------------------------------------------------
// Load shortcuts from all files
//----------------------------------------------------------------------------------------------------------------------

export function loadShortcuts(config: Config): Shortcuts {
    const result = new Map<string, Shortcut>();
    for (const { file, lineNumber, line } of readLinesFromAllFiles(config.inputFiles)) {
        const fail = (message: string) => {
            console.error(file ? `${file}:${lineNumber} ${message}` : `Error on line ${lineNumber}: ${message}`);
            process.exit(1);
        };
        const parsedLine = parseLine({ ...config, fail }, line);
        if (parsedLine) {
            result.set(parsedLine.keyword, mergeShortcuts(result.get(parsedLine.keyword), parsedLine));
        }
    }
    return result;
}

//----------------------------------------------------------------------------------------------------------------------
// Read the lines from all files
//----------------------------------------------------------------------------------------------------------------------

function readLinesFromAllFiles(files: ReadonlyArray<string>) {
    return files.flatMap(file =>
        readLinesFromFile(file).map((line, index) => ({
            file: STDIN_OR_STDOUT === file ? undefined : file,
            lineNumber: index + 1,
            line,
        }))
    );
}

//----------------------------------------------------------------------------------------------------------------------
// Read all lines from a file (or stdin)
//----------------------------------------------------------------------------------------------------------------------

function readLinesFromFile(file: string) {
    try {
        return readFileSync(file === STDIN_OR_STDOUT ? 0 : file, "utf8").split(/\r?\n/);
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        return fail(`Failed to read ${file === STDIN_OR_STDOUT ? "from stdin" : file}: ${message}`);
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Get the new/consolidated/replaced shortcut for the given parsed line
//----------------------------------------------------------------------------------------------------------------------

export function mergeShortcuts(previous: Shortcut | undefined, { description, mustOverwrite, path }: ParsedLine) {
    return !previous || mustOverwrite
        ? { isOverwriting: mustOverwrite, directories: [{ description, path }] }
        : { ...previous, directories: [...previous.directories, { description, path }] };
}
