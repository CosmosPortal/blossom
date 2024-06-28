import { Database } from "../../Classes";
import { DatabaseConnect } from "../Database";
import { InfractionSystem } from "../../Entities";
import type { FindInfractionData } from "../../Interfaces";
import type { Snowflake } from "../../Types";

/**
 * Finds an infraction in a guild
 * @param {Snowflake} guild_id - The guild ID the infraction belongs in
 * @param {FindInfractionData} data - The structure of data to filter
 * 
 * @example
 * ```ts
 * console.log(await FindInfraction(guild.id, { is_inactive: true }));
 * ```
 */
export async function FindInfraction(guild_id: Snowflake, data: FindInfractionData = {}): Promise<InfractionSystem | InfractionSystem[] | null> {
    if (!Database.isInitialized) await DatabaseConnect();

    let infractions = Database.manager.createQueryBuilder(InfractionSystem, "InfractionSystem")
    .leftJoinAndSelect("InfractionSystem.Guild", "Guild")
    .where("InfractionSystem.Guild_ID = :Guild_ID", { Guild_ID: guild_id })

    if (data.action_id) infractions = infractions.andWhere("InfractionSystem.ActionID = :ActionID", { ActionID: data.action_id });
    if (data.from_member) infractions = infractions.andWhere("InfractionSystem.TargetID = :TargetID", { TargetID: data.from_member });
    if (!data.is_inactive) infractions = infractions.andWhere("InfractionSystem.Active = :Active", { Active: true });
    if (data.type) infractions = infractions.andWhere("InfractionSystem.Type = :Type", { Type: data.type });
    if (data.return_one) return await infractions.getOne();

    const infraction_data = await infractions.getMany();
    return infraction_data.length === 0 ? null : infraction_data;
};