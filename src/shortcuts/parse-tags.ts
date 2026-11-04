import { Config, ExtendedConfig } from "../types/config.js";

//----------------------------------------------------------------------------------------------------------------------
// Parse tags
//----------------------------------------------------------------------------------------------------------------------

export function parseTags(config: ExtendedConfig, tagColumn: string | undefined) {
    const trimmed = tagColumn?.trim() ?? "";
    if (!trimmed) {
        return { matchesFilter: true } as const;
    }
    const { isBlacklist, tags } = splitTags(config, trimmed);
    tags.forEach(tag => validateTag(config, tag));
    return isBlacklist ? applyBlacklistFilter(config, tags) : applyWhitelistFilter(config, tags);
}

//----------------------------------------------------------------------------------------------------------------------
// Split the tags
//----------------------------------------------------------------------------------------------------------------------

function splitTags({ fail }: ExtendedConfig, tags: string) {
    const isBlacklist = tags.startsWith("-");
    const normalized = tags
        .slice(isBlacklist ? 1 : 0)
        .split(",")
        .map(tag => tag.trim().toLowerCase())
        .filter(Boolean);
    if (isBlacklist && !normalized.length) {
        fail("The tags are missing");
    }
    return { isBlacklist, tags: normalized } as const;
}

//----------------------------------------------------------------------------------------------------------------------
// Validate the tags
//----------------------------------------------------------------------------------------------------------------------

function validateTag({ fail, validateTags }: ExtendedConfig, tag: string) {
    if (!/^[a-z0-9]+$/.test(tag)) {
        fail(`Tag "${tag}" contains invalid characters (tags must only contain letters and digits)`);
    }
    if (false === validateTags?.has(tag)) {
        fail(`Invalid tag "${tag}"`);
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Determine if the line should be included or excluded
//----------------------------------------------------------------------------------------------------------------------

function applyBlacklistFilter({ filterTags: selectedTags }: Config, tags: ReadonlyArray<string>) {
    const matchesFilter = selectedTags ? [...selectedTags].some(selectedTag => !tags.includes(selectedTag)) : true;
    return { matchesFilter } as const;
}

function applyWhitelistFilter({ filterTags: selectedTags }: Config, tags: ReadonlyArray<string>) {
    const matchesFilter = selectedTags ? [...selectedTags].some(tag => tags.includes(tag)) : true;
    return { matchesFilter } as const;
}
