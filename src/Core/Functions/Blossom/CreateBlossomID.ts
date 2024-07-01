import { RandomNumber } from "@cosmosportal/blossom.utils";
import type { BlossomID } from "../../Types";

/**
 * Creates an Blossom ID for an system
 * @param {number} timestamp - The creation timestamp
 * 
 * @example
 * ```ts
 * console.log(CreateBlossomID(Date.now())); // Output example: "2024-06-30-10000"
 * ```
 */
export function CreateBlossomID(timestamp?: number): BlossomID {
    const time: Date = new Date(timestamp ?? Date.now());
    const year: string = String(time.getFullYear());
    const month: string = String(time.getMonth() + 1).padStart(2, "0");
    const date: string = String(time.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}-${RandomNumber(10000, 99999)}`;
};