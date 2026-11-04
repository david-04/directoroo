import { ExtendedConfig } from "../types/config.js";
import { DecomposedPath, isEnvironmentVariable } from "../types/shortcuts.js";
import { existsSync, statSync } from "node:fs";
import { normalize } from "node:path";

//----------------------------------------------------------------------------------------------------------------------
// Parse the path
//----------------------------------------------------------------------------------------------------------------------

export function parseDirectory(config: ExtendedConfig, pathColumn: string) {
    const { mustOverwrite, path } = splitIndicatorAndPath(config, pathColumn);
    return { mustOverwrite, path: splitAndValidatePath(config, path) } as const;
}

//----------------------------------------------------------------------------------------------------------------------
// Extract the append or overwrite indicator from the path
//----------------------------------------------------------------------------------------------------------------------

function splitIndicatorAndPath({ appendIndicator, overwriteIndicator }: ExtendedConfig, path: string) {
    const trimmed = path.trim();
    if (appendIndicator && trimmed.startsWith(appendIndicator)) {
        return { mustOverwrite: false, path: trimmed.substring(appendIndicator.length).trim() } as const;
    } else if (overwriteIndicator && trimmed.startsWith(overwriteIndicator)) {
        return { mustOverwrite: true, path: trimmed.substring(overwriteIndicator.length).trim() } as const;
    } else {
        return { mustOverwrite: false, path: trimmed };
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Split the path (into static segments and environment variables) and validate it
//----------------------------------------------------------------------------------------------------------------------

function splitAndValidatePath(config: ExtendedConfig, path: string) {
    const trimmed = path.trim();
    if (!trimmed) {
        config.fail("The path is missing");
    }
    const decomposed = decomposePath(trimmed).filter(Boolean);
    const expanded = expandEnvironmentVariables(decomposed);
    if (config.validateEnvironmentVariables) {
        assertEnvironmentVariablesExist(config, decomposed);
    }
    if (config.validatePaths) {
        assertPathExists(config, expanded);
    }
    const effective = config.expandEnvironmentVariables ? [expanded] : decomposed;
    return { decomposed, effective, expanded } as const;
}

//----------------------------------------------------------------------------------------------------------------------
// Decompose a path into static segments and environment variables
//----------------------------------------------------------------------------------------------------------------------

function decomposePath(path: string): DecomposedPath {
    const match = /\$(\{[^}]*\}|\([^)]+\)|(\w+))/.exec(path);
    return match
        ? [
              path.substring(0, match.index),
              { environmentVariable: match[0].replace(/^\$[({]?/, "").replace(/[)}]/, "") },
              ...decomposePath(path.substring(match.index + match[0].length)),
          ]
        : [path];
}

//----------------------------------------------------------------------------------------------------------------------
// Expand all environment variables within a path
//----------------------------------------------------------------------------------------------------------------------

function expandEnvironmentVariables(path: DecomposedPath) {
    return path
        .map(segment => (isEnvironmentVariable(segment) ? (getEnvironmentVariableValue(segment) ?? "") : segment))
        .join("");
}

//----------------------------------------------------------------------------------------------------------------------
// Perform validations
//----------------------------------------------------------------------------------------------------------------------

export function assertPathExists(config: ExtendedConfig, path: string) {
    const normalizedPath = normalize(path);
    return path.toLowerCase().endsWith(".code-workspace")
        ? assertFileExists(config, normalizedPath)
        : assertDirectoryExists(config, normalizedPath);
}

function assertEnvironmentVariablesExist({ fail }: ExtendedConfig, path: DecomposedPath) {
    for (const segment of path) {
        if ("string" !== typeof segment && !getEnvironmentVariableValue(segment)) {
            fail(`Environment variable "${segment.environmentVariable}" is not set`);
        }
    }
}

function assertDirectoryExists({ fail }: ExtendedConfig, path: string) {
    if (!existsSync(path)) {
        fail(`Directory ${path} does not exist`);
    } else if (!statSync(path).isDirectory()) {
        fail(`${path} is not a directory`);
    }
}

function assertFileExists({ fail }: ExtendedConfig, path: string) {
    if (!existsSync(path)) {
        fail(`File ${path} does not exist`);
    } else if (!statSync(path).isFile()) {
        fail(`${path} is not a file`);
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Utilities
//----------------------------------------------------------------------------------------------------------------------

function getEnvironmentVariableValue(segment: DecomposedPath.EnvironmentVariable) {
    return process.env[segment.environmentVariable];
}
