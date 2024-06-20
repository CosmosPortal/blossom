/**
 * Formats a time to a valid time
 * @param {number} seconds - The time in seconds
 * @param {string} separator - The separator to join the values
 * 
 * @example
 * ```ts
 * const format = FormatTime(60, ", ");
 * ```
 */
export function FormatTime(seconds: number, separator: string = ","): string {
    if (seconds === 0) return "0 Seconds";

    const times = [
        { unit: "Year", seconds: 31536000 },
        { unit: "Month", seconds: 2592000 },
        { unit: "Week", seconds: 604800 },
        { unit: "Day", seconds: 86400 },
        { unit: "Hour", seconds: 3600 },
        { unit: "Minute", seconds: 60 },
        { unit: "Second", seconds: 1 }
    ];

    let timeout_unit = [];

    for (const { unit, seconds: unit_seconds } of times) {
        if (seconds >= unit_seconds) {
            const unitValue = Math.floor(seconds / unit_seconds);
            timeout_unit.push(`${unitValue} ${unit}${unitValue !== 1 ? "s" : ""}`);
            seconds %= unit_seconds;
        };
    };

    return timeout_unit.join(separator);
};