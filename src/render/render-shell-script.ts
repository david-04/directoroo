import { SHELL_SCRIPT_TEMPLATE } from "../generated/shell-script-template.js";
import { Config } from "../types/config.js";
import { Directory, isEnvironmentVariable, Shortcut, Shortcuts } from "../types/shortcuts.js";

export function renderShellScript(_config: Config, shortcuts: Shortcuts) {
    return SHELL_SCRIPT_TEMPLATE.replace(/[ \t]*# INSERT_RULES_HERE/, renderSwitchCaseStatements(shortcuts));
}

function renderSwitchCaseStatements(shortcuts: Shortcuts) {
    return Array.from(shortcuts.entries())
        .map(([shortcut, shortcutDefinition]) => renderSwitchCaseStatement(shortcut, shortcutDefinition))
        .join("\n");
}

function renderSwitchCaseStatement(shortcut: string, shortcutDefinition: Shortcut) {
    const result = new Array<string>();
    result.push(`${shortcut})`);
    if (shortcutDefinition.isOverwriting) {
        result.push("    DIRECTOROO_DELEGATE=");
    }
    result.push(`    DIRECTORIES=(${renderDirectories(shortcutDefinition)} "$@")`, "    ;;");
    return result.map(line => `    ${line}`).join("\n");
}

function renderDirectories(shortcut: Shortcut) {
    return shortcut.directories.map(renderDirectory).join(" ");
}

function renderDirectory(directory: Directory) {
    const segments = directory.path.effective.map(segment =>
        isEnvironmentVariable(segment) ? `\${${segment.environmentVariable}}` : segment
    );
    return `"${segments.join("")}"`.replaceAll("\\", "/");
}
