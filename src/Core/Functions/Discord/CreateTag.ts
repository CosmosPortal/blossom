import { CreateBlossomID } from "../Blossom";
import { Database } from "../../Classes";
import { DatabaseConnect, FindOrCreateEntity } from "../Database";
import { GuildSystem, TagSystem } from "../../Entities";
import type { TagCreation } from "../../Interfaces";

/**
 * Creates a tag in a guild
 * @param {TagCreation} data - The structure of data needed to create the tag
 * 
 * @example
 * ```ts
 * const tag = await CreateTag({
 *     Content: "Hey!",
 *     CreationTimestamp: Date.now(),
 *     CreatorID: user.id,
 *     Name: "say-hey"
 * });
 * ```
 */
export async function CreateTag(data: TagCreation): Promise<TagSystem> {
    if (!Database.isInitialized) await DatabaseConnect();

    const creation_timestamp = data.CreationTimestamp ?? Date.now();
    const guild_system = await FindOrCreateEntity(GuildSystem, { Snowflake: data.Snowflake });

    const tag = new TagSystem();
    tag.BlossomID = data.BlossomID ?? CreateBlossomID(creation_timestamp);
    tag.Content = data.Content;
    tag.CreationTimestamp = creation_timestamp;
    tag.CreatorID = data.CreatorID;
    tag.Guild_ID = data.Snowflake;
    tag.Name = data.Name;
    tag.RequireStaffRole = data.RequireStaffRole ?? false;
    tag.UsageCount = data.UsageCount ?? 0;
    tag.Guild = guild_system;
    await Database.manager.save(tag);

    return tag;
};