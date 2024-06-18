import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { GuildID } from "../../Entities";
import { FindOrCreateEntity } from "./FindOrCreateEntity";
import type { GuildIDTypes, Snowflake } from "../../Types";

/**
 * Updates a value from GuildID
 * @param {Snowflake} snowflake - The snowflake to update the GuildID value
 * @param {GuildIDTypes} type - The type of GuildID value
 * 
 * @example
 * ```ts
 * const total_infractions = await UpdateGuildID(interaction.guild.id, "InfractionCreation");
 * ```
 */
export async function UpdateGuildID(snowflake: Snowflake, type: GuildIDTypes): Promise<number> {
    if (!Database.isInitialized) await DatabaseConnect();
    const data = await FindOrCreateEntity(GuildID, { Snowflake: snowflake })
    const current_amount = data[type] + 1;
    await Database.manager.update(GuildID, { Snowflake: snowflake }, { [type]: current_amount });

    return current_amount;
};