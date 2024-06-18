import { FindGuildInfractions } from "../Database";
import type { InfractionType, Snowflake } from "../../Types";
/**
 * Formats a guild's infractions
 * @param {Snowflake} guild_id - The guild ID to find the infractions
 * @param {InfractionType} type - The infraction type to find
 * @param {boolean} is_inactive - Whether to check for inactive infractions as well
 * 
 * @example
 * ```ts
 * const format = await FormatGuildInfractions(interaction.guild.id, "BanAdd", true);
 * ```
 */
export async function FormatGuildInfractions(guild_id: Snowflake, type: InfractionType, is_inactive: boolean = false): Promise<string | undefined> {
    const infractions = await FindGuildInfractions(guild_id, type, is_inactive);
    if (!infractions) return;

    let format = "";
    let char_count = 0;

    for (const infraction of infractions) {
        const { ActionID, Active, CreationTimestamp } = infraction;
        const infraction_format = `${Active ? "[`Active`]" : "[`Inactive`]"} | \`${ActionID}\` • <t:${Math.trunc(Math.floor(Number(CreationTimestamp) / 1000))}:D>\n`;

        if (char_count + infraction_format.length) {
            format += infraction_format;
            char_count += infraction_format.length;
        }
        else break;
    };

    return format;
};