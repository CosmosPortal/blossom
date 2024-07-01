import { FindInfraction } from "../Discord";
import { InfractionSystem } from "../../Entities";
import type { FormatInfractionData } from "../../Interfaces";
import type { Snowflake } from "../../Types";

/**
 * Formats the infractions
 * @param {Snowflake} guild_id - The guild ID the infraction belongs in
 * @param {FormatInfractionData} data - The structure of data to filter
 * 
 * @example
 * ```ts
 * console.log(await FormatInfraction(guild.id, { is_inactive: true }));
 * ```
 */
export async function FormatInfraction(guild_id: Snowflake, data: FormatInfractionData = {}): Promise<string | undefined> {
    const infractions = await FindInfraction(guild_id, {
        blossom_id: data.blossom_id,
        from_member: data.from_member,
        is_inactive: data.is_inactive,
        type: data.type
    }) as InfractionSystem[];
    if (!infractions) return;

    let format = "";
    let char_count = 0;

    for (const infraction of infractions) {
        const { BlossomID, Active, CreationTimestamp } = infraction;
        const infraction_format = `${Active ? "[`Active`]" : "[`Inactive`]"} | \`${BlossomID}\` • <t:${Math.trunc(Math.floor(CreationTimestamp / 1000))}:D>\n`;

        if (char_count + infraction_format.length) {
            format += infraction_format;
            char_count += infraction_format.length;
        }
        else break;
    };

    return format;
};