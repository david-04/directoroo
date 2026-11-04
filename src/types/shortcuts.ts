//----------------------------------------------------------------------------------------------------------------------
// Parsed and validated shortcuts
//----------------------------------------------------------------------------------------------------------------------

export type Shortcuts = ReadonlyMap<string, Shortcut>;

export type Shortcut = Readonly<{ isOverwriting: boolean; directories: ReadonlyArray<Directory> }>;

export type Directory = Readonly<{
    description: string;
    path: Readonly<{ decomposed: DecomposedPath; effective: DecomposedPath; expanded: string }>;
}>;

export type Directories = ReadonlyArray<Directory>;

export type DecomposedPath = ReadonlyArray<DecomposedPath.Segment>;

export namespace DecomposedPath {
    export type Segment = string | EnvironmentVariable;
    export type EnvironmentVariable = Readonly<{ environmentVariable: string }>;
}

export function isEnvironmentVariable(segment: DecomposedPath.Segment): segment is DecomposedPath.EnvironmentVariable {
    return "string" === typeof segment ? false : !!(segment satisfies DecomposedPath.EnvironmentVariable);
}
