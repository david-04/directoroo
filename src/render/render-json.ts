import { Config } from "../types/config.js";
import { Directory, Shortcut, Shortcuts } from "../types/shortcuts.js";

export function renderJson(_config: Config, shortcuts: Shortcuts) {
    const entries = Array.from(shortcuts.entries())
        .map(([shortcut, shortcutDefinition]) => [shortcut, assembleShortcut(shortcutDefinition)] as const)
        .sort((a, b) => a[0].toLocaleLowerCase().localeCompare(b[0].toLocaleLowerCase()));
    return JSON.stringify(Object.fromEntries(entries), undefined, 4);
}

function assembleShortcut(shortcut: Shortcut) {
    return { isOverwriting: shortcut.isOverwriting, directories: shortcut.directories.map(assembleDirectory) } as const;
}

function assembleDirectory(directory: Directory) {
    return { description: directory.description, path: directory.path.effective } as const;
}
