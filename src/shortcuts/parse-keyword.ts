import { ExtendedConfig } from "../types/config.js";

//----------------------------------------------------------------------------------------------------------------------
// Parse the keyword
//----------------------------------------------------------------------------------------------------------------------

export function parseKeyword({ fail }: ExtendedConfig, keyword: string) {
    const trimmed = keyword.trim();
    if (!trimmed) {
        fail("The keyword is missing");
    } else if (/['"]/.test(trimmed)) {
        fail(`Keyword ${trimmed} contains quotes`);
    } else if (/[$]/.test(trimmed)) {
        fail(`Keyword "${trimmed}" contains a dollar sign ($)`);
    } else if (/\s/.test(trimmed)) {
        fail(`Keyword "${trimmed}" contains whitespace`);
    }
    return trimmed;
}
