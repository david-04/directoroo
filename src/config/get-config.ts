import { VERSION } from "../generated/version.js";
import { DEFAULT_APPEND_INDICATOR, DEFAULT_OVERWRITE_INDICATOR, DEFAULT_SEPARATOR } from "./defaults.js";
import { HELP_TEXT, parseArgs, ParsedArgs } from "./parse-args.js";
import { fail } from "@david-04/typefinity-cli";

//----------------------------------------------------------------------------------------------------------------------
// Retrieve the configuration
//----------------------------------------------------------------------------------------------------------------------

export function getConfig(argv: ReadonlyArray<string>) {
    const parsed = parseArgs(argv);
    handleHelpAndVersion(parsed);
    assertAtLeastOneInput(parsed.inputFiles);
    assertAtLeaseOneOutput(parsed);
    return {
        ...parsed,
        validateEnvironmentVariables: Boolean(parsed.validateEnvironmentVariables),
        expandEnvironmentVariables: Boolean(parsed.expandEnvironmentVariables),
        validatePaths: Boolean(parsed.validatePaths),
        filterTags: normalizeAndValidateTags(parsed.filterTags),
        validateTags: normalizeAndValidateTags(parsed.validateTags),
        separator: parsed.separator ?? DEFAULT_SEPARATOR,
        ...resolveAppendAndOverwriteIndicators(parsed),
    } as const;
}

//----------------------------------------------------------------------------------------------------------------------
// Display version information and/or the help screen
//----------------------------------------------------------------------------------------------------------------------

function handleHelpAndVersion({ help, version }: ParsedArgs) {
    const messageToDisplay = [...(version ? [`directoroo ${VERSION}`] : []), ...(help ? [HELP_TEXT] : [])];
    if (messageToDisplay.length) {
        console.log(messageToDisplay.join("\n\n"));
        process.exit(0);
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Assert that at least one input file is specified
//----------------------------------------------------------------------------------------------------------------------

function assertAtLeastOneInput(inputFiles: ReadonlyArray<string>) {
    if (!inputFiles.length) {
        fail("At least one input file must be specified");
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Assert that at least one output option is specified
//----------------------------------------------------------------------------------------------------------------------

function assertAtLeaseOneOutput(args: ParsedArgs) {
    if (!args.output.length) {
        fail("At least one output option must be specified");
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Convert tags into a lowercase'd set
//----------------------------------------------------------------------------------------------------------------------

function normalizeAndValidateTags(tags: ReadonlyArray<string> | undefined): ReadonlySet<string> | undefined {
    return tags ? new Set(tags.map(normalizeAndValidateTag)) : undefined;
}

function normalizeAndValidateTag(tag: string) {
    const normalized = tag.toLowerCase();
    if (!/^[a-z0-9]+$/.test(normalized)) {
        fail(`Invalid tag ${tag} (can only contain letters and digits)`);
    }
    return normalized;
}

//----------------------------------------------------------------------------------------------------------------------
// Resolve the append and overwrite indicators
//----------------------------------------------------------------------------------------------------------------------

function resolveAppendAndOverwriteIndicators(args: ParsedArgs) {
    const append = resolveIndicator(args.appendIndicator, DEFAULT_APPEND_INDICATOR, args.overwriteIndicator);
    const overwrite = resolveIndicator(args.overwriteIndicator, DEFAULT_OVERWRITE_INDICATOR, args.appendIndicator);
    if (append && append === overwrite) {
        fail(`appendIndicator and overwriteIndicator must not be the same: "${append}"`);
    }
    return { appendIndicator: append, overwriteIndicator: overwrite } as const;
}

function resolveIndicator(currentValue: string | undefined, defaultValue: string, otherValue: string | undefined) {
    return currentValue ?? (otherValue === defaultValue ? undefined : defaultValue);
}
