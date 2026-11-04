#!/usr/bin/env bash

set -e -o pipefail

function __fp_get_version_number() {
    unset -f __fp_get_version_number
    if [[ -f "CHANGELOG.md" ]]; then
        grep -E "^## \[[0-9.]+\]" CHANGELOG.md | head -1 | sed "s|^\#\# \[||;s|\].*||"
    elif [[ -f "../CHANGELOG.md" ]]; then

        grep -E "^## \[[0-9.]+\]" ../CHANGELOG.md | head -1 | sed "s|^\#\# \[||;s|\].*||"
    else
        echo "ERROR: Failed to lcoate CHANGELOG.md" >&2
        return 1
    fi
}

__fp_get_version_number "$@"
