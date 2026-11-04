![](resources/images/readme-banner.png)

Configure directory shortcuts (aliases) in a single place and use them with [VSCode Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager) and in POSIX shells (`cd` command).

- [Quick start](#quick-start)
- [Config file format](#config-file-format)
  - [Comments](#comments)
  - [Shortcut syntax](#shortcut-syntax)
  - [Paths and environment variables](#paths-and-environment-variables)
  - [Tags](#tags)
- [Output formats](#output-formats)
  - [VSCode Project Manager](#vscode-project-manager)
  - [Shell cd command](#shell-cd-command)
  - [JSON](#json)
- [Multiple input files](#multiple-input-files)
  - [Merged output file](#merged-output-files)
  - [Separate output files](#separate-output-files)

## Quick-start

Create a plain text file with the directory shortcuts:

```sh
# Format: <SHORTCUT> :: <DESCRIPTION> :: <PATH>

h  :: home       :: ${HOME}
mp :: my-project :: ${HOME}/projects/my-project
t  :: temp       :: /tmp
```

Create a configuration file for the [VSCode Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager):

```sh
npx -y directoroo my-shortcuts.txt --output-vsc-project-manager=projects.json
```

Create a wrapper shell script around the `cd` command (POSIX shells only):

```sh
npx -y directoroo my-shortcuts.txt --output-sh=~/directoroo-cd.sh
```

To use the wrapper script, create an alias in your `.profile`/`.bashrc`:

```sh
alias cd='. ~/directoroo-cd.sh'
```

Use the shortcuts transparently via the `cd` command:

```sh
# changes to ${HOME}/projects/my-project (unless ./mp exists)
cd mp
```

## Config file format

### Comments

Lines starting with a hash (`#`) are treated as comments. They are ignored.

### Shortcut syntax

Shortcuts consist of 3 or 4 columns separated by a double-colon:

```sh
# 3 columns: <SHORTCUT> :: <DESCRIPTION> :: <DIRECTORY>
mp :: my project :: ${HOME}/projects/my-project

# 4 columns <SHORTCUT> :: <DESCRIPTION> :: <TAGS> :: <DIRECTORY>
mp :: my project :: personal,vsc :: ${HOME}/projects/my-project
```

Tags are arbitrary strings that can be used to filter shortcuts (see below).

### Paths and environment variables

Paths must be absolute paths. They can contain environment variables in the format `${VARIABLE_NAME}`:

```sh
mp :: my project :: /usr/alex/projects/my-project # ✅ absolute path
mp :: my project :: ${HOME}/projects/my-project   # ✅ environment variable
```

Paths must not be relative. They must not contain the tilde placeholder either:

```sh
mp :: my project :: ./projects/my-project # ⛔ not an absolute path
mp :: my project :: ~/projects/my-project # ⛔ the tilde placeholder is not supported
```

Command-line options control how environment variables and paths are handled:

- `--validate-environment-variables`
  Verify that all referenced environment variables are set. This option does not expand environment variables.
- ` --expand-environment-variables`
  Replace environment variables with their value. Without this option, environment variable references are preserved in the generated output files (unless the output format does not support them).
- `--validate-paths`
  Verify that all paths exist. Environment variables are expanded temporarily before checking. Environment variables that are not set expand to an empty string. To be valid, a path must point to either a directory or to a file with the extension `.code-workspace`.

### Tags

Shortcuts can have arbitrary tags assigned to them. Tags are case-insensitive. They can only contain letters and digits. Tags can also be negated, meaning that a shortcut has all tags except the specified ones:

```sh
mp :: my project ::  personal,vsc :: ${HOME}/projects/my-project # only tags personal + vsc
mp :: my project :: -personal,vsc :: ${HOME}/projects/my-project # all tags except personal + vsc
```

Tags are useful for linking output-format-specific paths to shortcuts. For example, a shortcut might include multiple directories, with a [VSCode multi-root workspace](https://code.visualstudio.com/docs/editing/workspaces/workspaces#_multi-root-workspaces) file that opens all of them in a single editor window:

```sh
# Combined multi-root workspace for VSCode
mp :: my project :: vscode  :: ${HOME}/my-project.code-workspace

# Multiple directories for the terminal
mp :: my project :: cd      :: ${HOME}/projects/my-project
mp :: my project :: cd      :: ${HOME}/documentation/my-project

# Multiple directories for everything except VSCode
mp :: my project :: -vscode :: ${HOME}/projects/my-project
mp :: my project :: -vscode :: ${HOME}/documentation/my-project
```

Command-line options impact how tags are handled:

- `--filter-tags=tag1,tag2,...`
  Include only shortcuts with at least one of the specified tags when generating output files.
- `--validate-tags=tag1,tag2,...`
  Verify that only the specified tags are being used. This option is useful for catching typos.

## Output formats

### VSCode Project Manager

Use the command-line option `--output-vsc-project-manager=[FILE]` to generate JSON configuration files for the [VSCode Project Manager](https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager). Configure the VSCode setting `projectManager.projectsLocation` to point to the generated file.

Directoroo always expands environment variables when generating configuration files for the VSCode Project Manager. Environment variables that are not set expand to an empty string.

### Shell cd command

Use the command-line option `--output-sh=[FILE]` to generate a shell script that wraps around the `cd` command. After generating the file, add the following alias to your `.profile`/`.bashrc`:

```sh
alias cd='. /path/to/generated/file'
```

With the alias set up, shortcuts are accessible through the regular `cd` command:

```sh
# this will change to the "my project" shortcut, e.g. ${HOME}/projects/my-project
cd mp
```

The shell script gives precedence to local directories. In the example above, if directory `./mp` exists, the `cd` command will change there (instead of the shortcut directory).

When a shortcut contains multiple directories, the script displays an interactive list to pick one.

### JSON

Use the command-line option `--output-sh=[FILE]` to export the shortcuts to a JSON file:

```json
{
  "mp": {
    "isOverwriting": false,
    "directories": [
      { "description": "my-project", "path": [{ "environmentVariable": "HOME" }, "/projects/my-project"] }
    ]
  },
  "t": { "isOverwriting": false, "directories": [{ "description": "temp", "path": ["/tmp"] }] }
}
```

## Multiple input files

Directory shortcuts can be spread across separate files:

```sh
# shared-shortcuts.txt
tp :: team-project :: ${REPOSITORIES}/team-project

# personal-shortcuts.txt
h  :: home         :: ${HOME}
mp :: my-project   :: ${HOME}/projects/my-project
t  :: temp         :: /tmp
```

Directoroo can generate either merged output files (containing the shortcuts from all input files) or separate output files (one for each input file).

### Merged output files

Multiple input files can be processed in one run. This generates a single output file (for each format):

```sh
npx -y directoroo shared-shortcuts.txt personal-shortcuts.txt \
       --output-vsc-project-manager=vsc-project-manager.json \
       --output-sh=directoroo-cd.sh
```

Passing multiple input files effectively concatenates them. The command needs to be rerun whenever any of the source files changes. This method is the only option for the VSCode project manager, as it does not support multiple configuration files in parallel.

### Separate output files

Rather than passing all input files at once, Directoroo can also be run for each input file separately. This generates a separate output file for each of them. This is only useful for the `cd` wrapper script and the raw JSON output. Start by generating a separate output file for each input file:

```
npx -y directoroo shared-shortcuts.txt --output-sh=~/directoroo-cd-shared.sh
npx -y directoroo personal-shortcuts.txt --output-sh=~/directoroo-cd-personal.sh
```

When defining `cd` command alias, set environment variable `DIRECTOROO_DELEGATE` to the script with the lower precedence. Then call the script with the higher precedence:

```sh
alias cd='DIRECTOROO_DELEGATE=~/directoroo-cd-shared.sh" . "~/directoroo-cd-personal.sh"'
```

With this approach, changing one input file requires only its output file to be regenerated. For example, if only the personal shortcuts have changed, only `directoroo-cd-personal.sh` needs to be regenerated. `directoroo-cd-shared.sh` continues to work as it is.
