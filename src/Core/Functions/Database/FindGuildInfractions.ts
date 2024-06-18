import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { InfractionSystem } from "../../Entities";
import type { InfractionType, Snowflake } from "../../Types";

/**
 * Finds all of the guild's infractions
 * @param {Snowflake} guild_id - The guild ID the member belongs in
 * @param {InfractionType} type - The type of infractions to find
 * @param {boolean} is_inactive - Whether to check for inactive infractions as well
 * 
 * @example
 * ```ts
 * const infraction = await FindGuildInfractions(interaction.guild.id, "BanAdd", true);
 * ```
 */
export async function FindGuildInfractions(guild_id: Snowflake, type: InfractionType, is_inactive: boolean = false): Promise<InfractionSystem[] | null> {
    if (!Database.isInitialized) await DatabaseConnect();
    let infractions = Database.manager.createQueryBuilder(InfractionSystem, "InfractionSystem")
    .leftJoinAndSelect("InfractionSystem.Guild", "Guild")
    .where("InfractionSystem.InfractionGuildID = :guild_id", { guild_id })
    .andWhere("InfractionSystem.Type = :Type", { Type: type });

    if (!is_inactive) infractions = infractions.andWhere("InfractionSystem.Active = :Active", { Active: true });
    const data = await infractions.getMany();

    return data.length === 0 ? null : data;
};