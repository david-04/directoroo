import { renderJson } from "../render/render-json.js";
import { renderShellScript } from "../render/render-shell-script.js";
import { renderVscProjectManager } from "../render/render-vsc-project-manager.js";
import { Config } from "../types/config.js";
import { Shortcuts } from "../types/shortcuts.js";
import { DEFAULT_APPEND_INDICATOR, DEFAULT_OVERWRITE_INDICATOR, DEFAULT_SEPARATOR } from "./defaults.js";
import { fail } from "@david-04/typefinity-cli";

//----------------------------------------------------------------------------------------------------------------------
// Data types
//----------------------------------------------------------------------------------------------------------------------

export type ParsedArgs = typeof EMPTY_PARSE_RESULT;
type CategorizedArg = ReturnType<typeof toCategorizedArg>;

//----------------------------------------------------------------------------------------------------------------------
// Configuration
//----------------------------------------------------------------------------------------------------------------------

export const STDIN_OR_STDOUT = "-";

const FLAG_PROPERTIES = {
    "--expand-environment-variables": "expandEnvironmentVariables",
    "--help": "help",
    "--validate-environment-variables": "validateEnvironmentVariables",
    "--validate-paths": "validatePaths",
    "--version": "version",
} as const;

const COMMA_LIST_OPTION_PROPERTIES = { "--filter-tags": "filterTags", "--validate-tags": "validateTags" } as const;

const SIMPLE_OPTION_PROPERTIES = {
    "--append-indicator": "appendIndicator",
    "--overwrite-indicator": "overwriteIndicator",
    "--separator": "separator",
} as const;

const OUTPUT_OPTIONS = {
    "--output-json": { description: "generated JSON file", render: renderJson },
    "--output-sh": { description: 'generated "cd" shell script', render: renderShellScript },
    "--output-vsc-project-manager": {
        description: "generated VS Code Project Manager configuration",
        render: renderVscProjectManager,
    },
};

const EMPTY_PARSE_RESULT = {
    appendIndicator: undefined as string | undefined,
    expandEnvironmentVariables: undefined as true | undefined,
    filterTags: undefined as ReadonlyArray<string> | undefined,
    help: undefined as true | undefined,
    inputFiles: [] as ReadonlyArray<string>,
    output: [] as ReadonlyArray<{
        readonly file: string;
        readonly render: (config: Config, shortcuts: Shortcuts) => string;
    }>,
    overwriteIndicator: undefined as string | undefined,
    separator: undefined as string | undefined,
    validateEnvironmentVariables: undefined as true | undefined,
    validatePaths: undefined as true | undefined,
    validateTags: undefined as ReadonlyArray<string> | undefined,
    version: undefined as true | undefined,
} as const;

//----------------------------------------------------------------------------------------------------------------------
// Help screen
//----------------------------------------------------------------------------------------------------------------------

const OUTPUT_OPTIONS_HELP_LINES = Object.entries(OUTPUT_OPTIONS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([option, data]) => [`${option}=[FILE]`.padEnd(38), data.description].join(""))
    .join("\n  ");

export const HELP_TEXT = `

    Usage: directoroo [OPTIONS] [INPUT_FILE...]

    Generate directory shortcuts for different applications

    Options:

      --append-indicator=[STRING]           input file path prefix for "append" mode (default: ${DEFAULT_APPEND_INDICATOR})
      --expand-environment-variables        expand environment variables in all output files
      --filter-tags=[TAG_1,TAG_2,...]       only output shortcuts that have at least one of the given tags
      --help                                show this help text
      ${OUTPUT_OPTIONS_HELP_LINES}
      --overwrite-indicator=[STRING]        input file path prefix for "overwrite" mode (default: ${DEFAULT_OVERWRITE_INDICATOR})
      --separator=[STRING]                  input file column separator (default: ${DEFAULT_SEPARATOR})
      --validate-environment-variables      verify that all referenced environment variables are set
      --validate-paths                      verify that all paths exist
      --validate-tags=[TAG_1,TAG_2,...]     verify that only the specified tags are used
      --version                             show the version number

    Input and output files can be set to "${STDIN_OR_STDOUT}" for stdin/stdout.
`
    .trim()
    .replaceAll("\n    ", "\n");

//----------------------------------------------------------------------------------------------------------------------
// Parse the arguments
//----------------------------------------------------------------------------------------------------------------------

export function parseArgs(argv: ReadonlyArray<string>) {
    const { optionsAndFiles, postTerminatorFiles } = splitByTerminator(argv.map(arg => arg.trim()));
    return [...optionsAndFiles.map(toCategorizedArg), ...postTerminatorFiles.map(toPositionalArg)].reduce(
        (accumulator, element) => reduceArg(accumulator, element),
        { ...EMPTY_PARSE_RESULT }
    );
}

//----------------------------------------------------------------------------------------------------------------------
// Split the arguments by the terminator ("--")
//----------------------------------------------------------------------------------------------------------------------

function splitByTerminator(argv: ReadonlyArray<string>) {
    const terminatorIndex = argv.indexOf("--");
    const optionsAndFiles = argv.slice(0, 0 <= terminatorIndex ? terminatorIndex : argv.length);
    const postTerminatorFiles = 0 <= terminatorIndex ? argv.slice(terminatorIndex + 1) : [];
    return { optionsAndFiles, postTerminatorFiles };
}

//----------------------------------------------------------------------------------------------------------------------
// Categorize an argument
//----------------------------------------------------------------------------------------------------------------------

function toCategorizedArg(arg: string) {
    if (!arg.startsWith("-") || arg === STDIN_OR_STDOUT) {
        return toPositionalArg(arg);
    }
    if (!arg.startsWith("--")) {
        failInvalidOption(arg);
    }
    const eqIndex = arg.indexOf("=");
    if (eqIndex < 0) {
        return { kind: "flag", name: arg.trim() } as const;
    }
    return { kind: "option", name: arg.slice(0, eqIndex).trim(), value: arg.slice(eqIndex + 1).trim() } as const;
}

function toPositionalArg(arg: string) {
    return { kind: "positional", value: arg } as const;
}

//----------------------------------------------------------------------------------------------------------------------
// Reduce an argument
//----------------------------------------------------------------------------------------------------------------------

function reduceArg(acc: ParsedArgs, arg: CategorizedArg) {
    if (arg.kind === "positional") {
        return reducePositionalArg(acc, arg.value);
    } else if (arg.kind === "flag") {
        return reduceFlag(acc, arg.name);
    } else {
        arg.kind satisfies "option";
        return reduceOption(acc, arg.name, arg.value);
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Reduce a positional argument
//----------------------------------------------------------------------------------------------------------------------

function reducePositionalArg(acc: ParsedArgs, arg: string) {
    return arg ? { ...acc, inputFiles: [...acc.inputFiles, arg] } : fail("Positional arguments must not be blank");
}

//----------------------------------------------------------------------------------------------------------------------
// Reduce a flag
//----------------------------------------------------------------------------------------------------------------------

function reduceFlag(acc: ParsedArgs, arg: string) {
    if (!(arg in FLAG_PROPERTIES)) {
        failInvalidOption(arg);
    }
    const key = FLAG_PROPERTIES[arg as keyof typeof FLAG_PROPERTIES];
    if (acc[key] !== undefined) {
        failDuplicateOption(arg);
    }
    return { ...acc, [key]: true };
}

//----------------------------------------------------------------------------------------------------------------------
// Reduce an option
//----------------------------------------------------------------------------------------------------------------------

function reduceOption(acc: ParsedArgs, name: string, rawValue: string) {
    if (name in FLAG_PROPERTIES) {
        return failMissingValue(name);
    } else if (name in COMMA_LIST_OPTION_PROPERTIES) {
        const key = COMMA_LIST_OPTION_PROPERTIES[name as keyof typeof COMMA_LIST_OPTION_PROPERTIES];
        return reduceOptionValue(acc, key, parseCommaSeparatedList(rawValue, name), name);
    } else if (name in SIMPLE_OPTION_PROPERTIES) {
        const key = SIMPLE_OPTION_PROPERTIES[name as keyof typeof SIMPLE_OPTION_PROPERTIES];
        return reduceOptionValue(acc, key, parseStringValue(rawValue, name), name);
    } else if (name in OUTPUT_OPTIONS) {
        const { render } = OUTPUT_OPTIONS[name as keyof typeof OUTPUT_OPTIONS];
        return { ...acc, output: [...acc.output, { file: parseStringValue(rawValue, name), render }] };
    }
    return failInvalidOption(name);
}

function parseCommaSeparatedList(value: string, optionName: string) {
    const items = value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    return items.length ? items : failMissingValue(optionName);
}

function parseStringValue(value: string, optionName: string) {
    return value.trim() || failMissingValue(optionName);
}

function reduceOptionValue<K extends keyof ParsedArgs>(
    acc: ParsedArgs,
    key: K,
    newValue: ParsedArgs[K],
    option: string
) {
    return acc[key] === undefined ? { ...acc, [key]: newValue } : failDuplicateOption(option);
}

//----------------------------------------------------------------------------------------------------------------------
// Errors
//----------------------------------------------------------------------------------------------------------------------

const TRY_HELP = 'Try "directoroo --help" for more information.';

function failInvalidOption(option: string) {
    return fail(`Invalid option ${option}. ${TRY_HELP}`);
}

function failMissingValue(option: string) {
    return fail(`Missing value for option ${option}. ${TRY_HELP}`);
}

function failDuplicateOption(option: string) {
    return fail(`Duplicate option ${option}. ${TRY_HELP}`);
}
