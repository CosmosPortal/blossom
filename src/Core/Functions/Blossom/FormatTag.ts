import { FindTag } from "../Discord";
import { TagSystem } from "../../Entities";
import type { FormatTagData } from "../../Interfaces";
import type { Snowflake } from "../../Types";

/**
 * Formats the tags
 * @param {Snowflake} guild_id - The guild ID the tag belongs in
 * @param {FormatTagData} data - The structure of data to filter
 * 
 * @example
 * ```ts
 * console.log(await FormatTag(guild.id, { staff_only: true }));
 * ```
 */
export async function FormatTag(guild_id: Snowflake, data: FormatTagData = {}): Promise<string | undefined> {
    const tags = await FindTag(guild_id, {
        blossom_id: data.blossom_id,
        from_member: data.from_member,
        staff_only: data.staff_only
    }) as TagSystem[];
    if (!tags) return;

    let format = "";
    let char_count = 0;

    for (const tag of tags) {
        const { BlossomID, CreationTimestamp, Name } = tag;
        const tag_format = `[\`${Name}\`] | \`${BlossomID}\` • <t:${Math.trunc(Math.floor(CreationTimestamp / 1000))}:D>\n`;

        if (char_count + tag_format.length) {
            format += tag_format;
            char_count += tag_format.length;
        }
        else break;
    };

    return format;
};