# Directoroo

This is a command-line application that converts a text file with directory shortcuts into different formats. The generated output file(s) can be used in other programs to open/go to directories using their designated shortcut(s). This allows users to define all their directory shortcuts in one file, and then use the same shortcuts in different applications.

## Project-specific rules

- All code is implemented in the `src` folder. Create subdirectories as required.
- Always use synchronous functions (like `readFileSync`). Do not create `async` functions.

## Global rules

- Do not add any comments to the code. Do not add JSDoc or JavaDoc comments either.
- When an error occurs, raise an exception. Do not return errors as a return value. Do not wrap return values into objects like `Either` or `Result`. A function's return type must only represent the happy-day scenario (successful completion).
- Prefer early returns to reduce the level of nesting, for example:

```js
// Instead of
function getConfig(file: string) {
  const json = loadFile(path);
    if (!document) {
      return undefined;
    }
    const config = JSON.parse(document)
    if (!config) {
      return undefined;
    }
    return new Config(config);
}
```

- Prefer functional chaining methods (like `filter`, `map`, `flatMap`, `reduce`) over `for` loops and `if-else` conditions.
- Do not use the chaining operations like `.then()` and `.error()` for promises. Instead, use `await` and `try-catch`.
- Always use immutable/read-only data structures.
- If the language supports it, explicitly mark all properties/attributes in interfaces, type definitions and classes as read-only.
- Use read-only containers like read-only arrays, read-only sets and read-only maps whenever possible.
- Declare variables and parameters as read-only (e.g. `const` in JavaScript or `final` in Java).
- Functions must not receive mutable containers (like arrays, sets and maps) as parameters. If possible, avoid mutable containers altogether. If that makes the code too complex, at least keep mutable containers confined to the function in which they are defined. For example:

```js
// bad pattern: pass a mutable container to another function
function main() {
  const myArray = [1, 2, 3]; // not great: mutable container
  addMore(myArray); // bad: pass mutable container to another function
}
function addMore(array: number[]) { // bad: receive mutable container
  array.push(4, 5, 6); // bad: modify mutable container
}
// good pattern: avoid mutable containers altogether
function main() {
  const array1 = [1, 2, 3] as const; // good: immutable container
  const array2 = withMore(array1); // good: pass only immutable containers
}
function withMore(array: readonly number[]) { // good: receive only immutable containers
    return [...array, 4, 5, 6] as const; // good: return only immutable containers
}
// acceptable pattern: mutate containers only in the function where they are defined
function main() {
  const myArray = [1, 2, 3]; // acceptable: mutable container that's only used in this function
  addMore().forEach(value => myArray.push(value)); // acceptable: mutate container only in the function where it's defined
}
function getMore() { // good: don't receive mutable containers
  return [4, 5, 6] as const; // good: return only immutable containers
}
```

- Split code into functions that are as small as possible to increase their readability and re-usability.
- Keep the nesting of blocks (`for` loops, `if-else` blocks and nested (arrow) functions) as shallow as possible. Try to move nested code into separate top-level functions to reduce the nesting/complexity of the parent function.
- Group functions with the same purpose into one file, and create separate files for functions with different purposes.
- Sort functions in the order in which they are called (so that the file can be read sequentially, in the same order as the code executes). The main function belongs to the top of the file, and utility functions to the bottom.
- Avoid global variables (except for immutable constants).
- Avoid using classes. Whenever supported by the programming language, use plain data objects (like object literals in JavaScript).
- In TypeScript, consider creating a `namespace` or an object literal instead of a singleton class.
- Write short functions (ideally, 10 lines of code or less). Split more complex logic into smaller functions.
- Avoid deep nesting of `if` conditions and loops. Ideally, nest only one or two levels deep. Move nested code that requires deeper nesting into its own function.
- Avoid defining complex arrow functions with multiple lines of code inside function calls. Instead, create a separate named function and pass it as parameter, for example:

```ts
// short arrow functions that fit into one or two lines should be defined inline:
myArray.forEach(value => console.log(value));
// avoid nesting arrow functions with multiple lines:
myArray.forEach(value => {
  // multiple lines of code
});
// instead, create a stand-alone function:
myArray.forEach(value => doSomething(value));
function doSomething(value: number) {
  // multiple lines of code
}
```

- All source files and directories other than React components must have kebab-case names (e.g. `src/db-tools/load-customer.js`).
- React components must have PascalCase names (e.g. `src/components/MyComponent.jsx`).
- Export items (like variables, functions, types, classes, interfaces, namespaces) right where they are defined, e.g.:

```js
export const MY_CONSTANT = "value";
export function myFunction() { };
export class MyClass { ... };
```

- Do not create separate `export` statements that export items that were defined earlier.
- Do not export or import items under different alias names. Each item should be referenced by its original name across the whole code base.
- Do not create barrel files (like `index.js`) that re-export items. Each module must import items from right where they are defined.
- If the project uses ECMAScript modules (esm), always import local files/relative paths with the file extension `.js` or `.jsx` (e.g. `import "./my-file.js"`). By default, assume that this project uses ECMAScript modules (esm) unless you have been explicitly advices that this is a CommonJS project.
- Always define top-level functions within a module or namespace as hoisted functions (using the `function` keyword), e.g.:

```ts
function myFunction() { ... }
namespace myNamespace {
  function myNamespaceFunction() { ... }
}
```

- Always define inline functions (like those passed as an inline expression to another function) as arrow functions, e.g.:

```js
myArray.map(item => item.toLowerCase());
```

- When creating types that belong to a function or a parent type, hide them within a namespace that shadows the parent function or type, e.g.:

```ts
export namespace myFunction {
  export type MyOptions { readonly Key: string };
}
export function myFunction(options: myFunction.MyOptions) { }
export type MyParentType {
  readonly child: MyParentType.MyChildType;
}
export namespace MyParentType {
  export type MyChildType { readonly myProperty: number };
}
```

- Avoid creating `type` definitions for functions' return types. If (and only if) necessary, automatically infer the type:

```ts
function myFunction() {
  return { key: "value" } as const;
}
type MyFunctionReturnType = ReturnType<typeof myFunction>;
```

- This project uses TypeScript. Do not plain JavaScript files.
- Do not add return type annotations to functions, if TypeScript can infer the return type automatically.
- Do not add type annotations to variables, if TypeScript can infer the type automatically.
- When assigning an object literal or array literal to a variable, annotate the literal with `as const`, e.g.:

```ts
const myObject = { key: "value" } as cont;
const myArray = ["item"] as const;
```

- Do not annotate object an array literals `ast const` when passing them inline to a function, e.g.:

```ts
myFunction({ key: "value" }); // no "as const"
myFunction(["item"]); // no "as const"
```

- Do not create `type` definitions or `interfaces` that can be inferred. Also avoid creating `type` definitions for the return type of functions. Instead, let TypeScript infer the type whenever possible. If a return type is needed (e.g. for a parameter in another function), use automatically inferred types wherever possible, for example:

```ts
const MY_CONSTANT = { key: "value" } as const;
type MyConstantType = typeof MY_CONSTANT; // infer the type from an exixsting value
function myFunction() {
  return { key: "value" } as const;
}
type MyFunctionReturnType = ReturnType<typeof myFunction>; // infer the type from the function's return value
```

- Prefer using TypeScript's built-in utility types, for example:

```ts
// avoid repeating modifiers:
type MyType = { readonly property1?: string,  readonly property2?: number };
// instead, use utility types:
type MyType = Readonly<Partial<{ property1: string, property2: number }>;
```

- Prefer the `Record` utility type over the indexer signature

```ts
type MyType = { [index: string]: number }; // bad: avoid indexer structure
type MyType = Record<string, number>; // good: use the "Record" utility type
```

- Never bypass/disable TypeScript's type checking.
  - Do not use the assertion operator (`!`).
  - Do not force-cast types (e.g. `myValue as unknown as MyType`).
  - Do not use the type `any`. Use `unknown` instead.
  - Do not add `@ts-ignore-error` or `@ts-expect-error` annotations.
- Instead of bypassing/disabling TypeScript's type checking, implement runtime checks that allow TypeScript's type system to safely confirm that a value is of a given type.
- Do not use `null`. Use `undefined` instead.
- This is a Node.js command-line application.
- Always import Node.js packages from the `node:` namespace, e.g.:

```js
import { readFile } from "node:fs";
```

- To raise an error, call function `fail("error message")` from the Typefinity package. The `fail` function raises an error and does not return. Do not instantiate/throw exceptions manually.
- This project uses the cli version of the Typefinity package. Import items via `import { ... } from "@david-04/typefinity-cli"`.
- Whenever possible, use the command-line tool `dev-command` to run commands inside the repository. Do not run arbitrary shell commands if there is a `dev-command` that accomplishes the same result. The following `dev-commands` are available:
  - To install all dependencies, run: `dev-command install`
  - To add a dependency to the project, run: `dev-command install <PACKAGE_NAME>`
  - To add a development dependency to the project, run: `dev-command install-dev <PACKAGE_NAME>`
  - To remove a dependency from the project, run: `dev-command uninstall <PACKAGE_NAME>`
  - To compile, format, lint, test and bundle the application (all in one go), run: `dev-command ai-verify`
- The `dev-command` works in all terminals and on all operating system (including `bash`, `cmd` and `powershell`).
- Do not try to run the compiler, formatter, linter, test runner or bundler directly. Only ever use `dev-command ai-verify`. Do not try to run npm scripts from `package.json`. Don't try to run any development commands like `tsc`, `eslint`, `jest` or `prettier`.
- Always prefer using available tools over running terminal commands (like `grep` or `find`). Whenever available, use the following tools for the following tasks:
  - Use `list_files` to find files by name (do not run `find` in the terminal)
  - Use `search_files` to find text in files (do not run `grep` in the terminal)
  - Use `get_file_skeleton` if you only need to know which classes, functions and methods are defined in a file - without needing to see their implementation yet (do not read the whole file)
  - Use `get_function` if you want to see the implementation of a function (do not read the whole file)
  - Use `find_symbol_references` to find out where (in which files) a symbol (like a class, function or variable) is used/referenced (to not run `grep` in the terminal).
  - Use `diagnostics_scan` to get all syntax and linting errors for a file (do not run the compiler or the dev-command in the terminal)
  - Use `rename_symbol` whenever you need to rename a function, class, method or variable (do not update the file via text replacement)
  - Use `replace_symbol` if you need to replace a symbol (function, class, method or variable) with something else (do not update the file via text replacement)
  - Use `ask_followup_question` whenever you need a decision or more input from the user
- Ask clarifying questions whenever the users intend is unclear or ambiguous, or if there are different ways to implement the users requirements. Always use the tool for asking the user questions. Always provide a set of predefined answers for the user to chose from, and always allow the user to also provide free-text input.
- Whenever you've made code changes, and if you have access to the tool `diagnostic_scan`, use this tool to check all added/modified files for syntax and linting errors. Correct these errors before proceeding.
- Whenever you have fully implemented the requested code changes ("feature-complete"), and whenever the users ask for a "quality gate", run perform the following steps:
  1. Remind yourself of all the guidelines, rules and instructions (like code style, error handling...) that are described in `AGENTS.md`.
  2. Review the code that you have changed or added against the guidelines from `AGENTS.md`. If the code does not align with the guidelines, modify the code so that it does comply.
  3. If you have access to a tool called `diagnostic_scan`, run it on all files that you have modified, to identify any syntax and linting errors. Fix all errors and rerun `diagnostic_scan` until it does not report any issues anymore.
  4. Run command `dev-command ai-verify` to compile, line, test, bundle and format the code. Fix all errors and re-run the command until it does no longer report any issues.
- Do not add additional dependencies (like npm packages), unless when the user explicitly asks for it.
- Before adding a dependency, ask the user for approval (use the "ask questions" tool if it's available). Do not attempt to add any dependency without explicit approval from the user.
- Assess dependencies on their maturity/stability and potential supply chain attack risks. Prefer dependencies with more widespread use (high number of downloads) that are well maintained (frequently updated). Prefer dependencies that are TypeScript-native (as opposed to JavaScript libraries that need an additional `@types` package). When suggesting dependencies to the user, state how these dependencies stack up against these criteria.
- This project does not use tests. Do not create any tests and do not try to run the tests.
