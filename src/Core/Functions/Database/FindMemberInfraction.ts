import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { InfractionSystem } from "../../Entities";
import type { Snowflake } from "../../Types";

/**
 * Finds one of the member's infractions
 * @param {Snowflake} guild_id - The guild ID the member belongs in
 * @param {Snowflake} member_id - The member ID to find the infraction
 * @param {string} action_id - The action ID to find the infraction
 * @param {boolean} is_inactive - Whether to check for inactive infractions as well
 * 
 * @example
 * ```ts
 * const infraction = await FindMemberInfraction(interaction.guild.id, interaction.user.id, "123456789", true);
 * ```
 */
export async function FindMemberInfraction(guild_id: Snowflake, member_id: Snowflake, action_id: string, is_inactive: boolean = false): Promise<InfractionSystem | null> {
    if (!Database.isInitialized) await DatabaseConnect();
    let infraction = Database.manager.createQueryBuilder(InfractionSystem, "InfractionSystem")
    .leftJoinAndSelect("InfractionSystem.Guild", "Guild")
    .where("InfractionSystem.ActionID = :action_id", { action_id })
    .andWhere("InfractionSystem.InfractionGuildID = :guild_id", { guild_id })
    .andWhere("InfractionSystem.TargetID = :member_id", { member_id });

    if (!is_inactive) infraction = infraction.andWhere("InfractionSystem.Active = :Active", { Active: true });

    return infraction.getOne();
};