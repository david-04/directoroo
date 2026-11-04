#!/usr/bin/env bash

set -e -o pipefail

function __directoroo_update_version_number() {
    unset -f __directoroo_update_version_number

    if [[ -d bin ]]; then
        cd bin
    fi
    echo Updating version number...
    echo "export const VERSION = \"$(get-version-number.sh)\";" >../src/generated/version.ts
    sed -i "s/\"version\"\\s*:\\s*\"[^\"]*\"/\"version\": \"$(get-version-number.sh)\"/g" ../resources/package.release.json
}

__directoroo_update_version_number "$@"
