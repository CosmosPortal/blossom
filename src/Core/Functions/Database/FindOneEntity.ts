import type { FindOneOptions, ObjectType } from "typeorm";
import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";

/**
 * Finds one entity
 * @param {ObjectType<T>} entity - The entity to find
 * @param {FindOneOptions<T>["where"]} criteria - Where it's located
 * 
 * @example
 * ```ts
 * const guild_role = await FindOneEntity(GuildRole, { Snowflake: interaction.guild.id });
 * ```
 */
export async function FindOneEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<T | null> {
    if (!Database.isInitialized) await DatabaseConnect();
    const data = await Database.manager.findOne(entity, { where: criteria });

    return data as T | null;
};