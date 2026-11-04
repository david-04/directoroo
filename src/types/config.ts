//----------------------------------------------------------------------------------------------------------------------
// Configuration
//----------------------------------------------------------------------------------------------------------------------

import { Shortcuts } from "./shortcuts.js";

export type Config = Readonly<{
    appendIndicator: string | undefined;
    overwriteIndicator: string | undefined;
    validateEnvironmentVariables: boolean;
    expandEnvironmentVariables: boolean;
    validatePaths: boolean;
    filterTags: ReadonlySet<string> | undefined;
    validateTags: ReadonlySet<string> | undefined;
    separator: string;
    help: true | undefined;
    inputFiles: ReadonlyArray<string>;
    output: ReadonlyArray<{ file: string; render: (config: Config, shortcuts: Shortcuts) => string }>;
    version: true | undefined;
}>;

export type ExtendedConfig = Config & { fail: (message: string) => never };
