import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { InfractionSystem } from "../../Entities";
import type { InfractionType, Snowflake } from "../../Types";

/**
 * Finds all of the member's infractions
 * @param {Snowflake} guild_id - The guild ID the member belongs in
 * @param {Snowflake} member_id - The member ID to find the infractions
 * @param {InfractionType} type - The type of infractions to find
 * @param {boolean} is_inactive - Whether to check for inactive infractions as well
 * 
 * @example
 * ```ts
 * const infraction = await FindMemberInfractions(interaction.guild.id, interaction.user.id, "BanAdd", true);
 * ```
 */
export async function FindMemberInfractions(guild_id: Snowflake, member_id: Snowflake, type: InfractionType, is_inactive: boolean = false): Promise<InfractionSystem[] | null> {
    if (!Database.isInitialized) await DatabaseConnect();
    let infractions = Database.manager.createQueryBuilder(InfractionSystem, "InfractionSystem")
    .leftJoinAndSelect("InfractionSystem.Guild", "Guild")
    .where("InfractionSystem.TargetID = :member_id", { member_id })
    .andWhere("InfractionSystem.InfractionGuildID = :guild_id", { guild_id })
    .andWhere("InfractionSystem.Type = :Type", { Type: type });

    if (!is_inactive) infractions = infractions.andWhere("InfractionSystem.Active = :Active", { Active: true });
    const data = await infractions.getMany();

    return data.length === 0 ? null : data;
};