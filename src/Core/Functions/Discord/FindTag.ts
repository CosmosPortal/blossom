import { Database } from "../../Classes";
import { DatabaseConnect } from "../Database";
import { TagSystem } from "../../Entities";
import type { FindTagData } from "../../Interfaces";
import type { Snowflake } from "../../Types";

/**
 * Finds a tag in a guild
 * @param {Snowflake} guild_id - The guild ID the tag belongs in
 * @param {FindTagData} data - The structure of data to filter
 * 
 * @example
 * ```ts
 * console.log(await FindTag(guild.id, { staff_only: true }));
 * ```
 */
export async function FindTag(guild_id: Snowflake, data: FindTagData = {}): Promise<TagSystem | TagSystem[] | null> {
    if (!Database.isInitialized) await DatabaseConnect();

    let tags = Database.manager.createQueryBuilder(TagSystem, "TagSystem")
    .leftJoinAndSelect("TagSystem.Guild", "Guild")
    .where("TagSystem.Guild_ID = :Guild_ID", { Guild_ID: guild_id })

    if (data.blossom_id) tags = tags.andWhere("TagSystem.BlossomID = :BlossomID", { BlossomID: data.blossom_id });
    if (data.from_member) tags = tags.andWhere("TagSystem.CreatorID = :CreatorID", { CreatorID: data.from_member });
    if (!data.staff_only) tags = tags.andWhere("TagSystem.RequireStaffRole = :RequireStaffRole", { RequireStaffRole: true });
    if (data.return_one) return await tags.getOne();

    const tag_data = await tags.getMany();
    return tag_data.length === 0 ? null : tag_data;
};