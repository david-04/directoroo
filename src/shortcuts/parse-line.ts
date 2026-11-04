import { ExtendedConfig } from "../types/config.js";
import { parseDescription } from "./parse-description.js";
import { parseKeyword } from "./parse-keyword.js";
import { parseDirectory } from "./parse-path.js";
import { parseTags } from "./parse-tags.js";

export type ParsedLine = Exclude<ReturnType<typeof parseLine>, undefined>;

//----------------------------------------------------------------------------------------------------------------------
// Parse a line
//----------------------------------------------------------------------------------------------------------------------

export function parseLine(config: ExtendedConfig, line: string) {
    if (isBlankOrComment(line)) {
        return undefined;
    }
    const columns = splitColumns(config, line);
    const keyword = parseKeyword(config, columns.keyword);
    const description = parseDescription(config, columns.description);
    if (!parseTags(config, columns.tags).matchesFilter) {
        return undefined;
    }
    return { keyword, description, ...parseDirectory(config, columns.path) } as const;
}

//----------------------------------------------------------------------------------------------------------------------
// Check if the line is blank or a comment
//----------------------------------------------------------------------------------------------------------------------

function isBlankOrComment(line: string) {
    const trimmed = line.trim();
    return !trimmed || trimmed.startsWith("#");
}

//----------------------------------------------------------------------------------------------------------------------
// Split the line into columns
//----------------------------------------------------------------------------------------------------------------------

export function splitColumns({ separator, fail }: ExtendedConfig, line: string) {
    const columns = line.split(separator).map(column => column.trim());
    const [keyword, description, column3, column4, ...rest] = columns;
    if (keyword === undefined || description === undefined || column3 === undefined || rest.length) {
        return fail(`Expected 3 or 4 columns separated by "${separator}", got ${columns.length}`);
    }
    const tags = column4 === undefined ? undefined : column3;
    const path = column4 ?? column3;
    return { keyword, description, tags, path };
}
