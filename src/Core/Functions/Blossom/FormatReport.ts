import { FindReport } from "../Discord";
import { ReportSystem } from "../../Entities";
import type { FormatReportData } from "../../Interfaces";
import type { Snowflake } from "../../Types";

/**
 * Formats the reports
 * @param {Snowflake} guild_id - The guild ID the report belongs in
 * @param {FormatReportData} data - The structure of data to filter
 * 
 * @example
 * ```ts
 * console.log(await FormatReport(guild.id, { is_inactive: true }));
 * ```
 */
export async function FormatReport(guild_id: Snowflake, data: FormatReportData = {}): Promise<string | undefined> {
    const reports = await FindReport(guild_id, {
        action_id: data.action_id,
        from_member: data.from_member,
        is_inactive: data.is_inactive,
        type: data.type
    }) as ReportSystem[];
    if (!reports) return;

    let format = "";
    let char_count = 0;

    for (const report of reports) {
        const { ActionID, Active, CreationTimestamp } = report;
        const report_format = `${Active ? "[`Active`]" : "[`Inactive`]"} | \`${ActionID}\` • <t:${Math.trunc(Math.floor(Number(CreationTimestamp) / 1000))}:D>\n`;

        if (char_count + report_format.length) {
            format += report_format;
            char_count += report_format.length;
        }
        else break;
    };

    return format;
};