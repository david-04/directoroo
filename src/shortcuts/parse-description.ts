import { ExtendedConfig } from "../types/config.js";

//----------------------------------------------------------------------------------------------------------------------
// Parse the description
//----------------------------------------------------------------------------------------------------------------------

export function parseDescription({ fail }: ExtendedConfig, description: string) {
    const trimmed = description.trim();
    if (!trimmed) {
        fail("The description is missing");
    } else if (/['"]/.test(trimmed)) {
        fail(`Description ${trimmed} contains quotes`);
    } else if (/[$]/.test(trimmed)) {
        fail(`Description "${trimmed}" contains a dollar sign ($)`);
    }
    return trimmed;
}
