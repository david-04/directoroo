import { Config } from "../types/config.js";
import { Directories, Shortcuts } from "../types/shortcuts.js";
import { normalize } from "node:path";

export function renderVscProjectManager(_config: Config, shortcuts: Shortcuts) {
    const entries = Array.from(shortcuts.entries())
        .flatMap(([shortcut, { directories }]) => assembleShortcut(shortcut, directories))
        .sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()));
    return JSON.stringify(entries, undefined, 4);
}

function assembleShortcut(shortcut: string, directories: Directories) {
    return directories.map(
        directory =>
            ({
                name: `${shortcut} - ${directory.description}`,
                rootPath: normalize(directory.path.expanded),
                paths: [],
                group: "",
                enabled: true,
            }) as const
    );
}
