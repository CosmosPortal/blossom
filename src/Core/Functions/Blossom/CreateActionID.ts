import { RandomNumber } from "@cosmosportal/blossom.utils";
import type { ActionID } from "../../Types";

/**
 * Creates an action ID for an system
 * @param {number} timestamp - The creation timestamp
 * 
 * @example
 * ```ts
 * const action_id = CreateActionID(Date.now());
 * ```
 */
export function CreateActionID(timestamp?: number): ActionID {
    const time = new Date(timestamp ?? Date.now());
    const year = String(time.getFullYear());
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const date = String(time.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}-${RandomNumber(1000, 9999)}`;
};