import type { FindOneOptions, ObjectType } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";

/**
 * Updates an entity with the given data
 * @param {ObjectType<T>} entity - The entity to update
 * @param {FindOneOptions<T>["where"]} criteria - Where it's located
 * @param {QueryDeepPartialEntity<T>} partial_entity - The updated data
 * 
 * @example
 * ```ts
 * await UpdateEntity(GuildRole, { Snowflake: interaction.guild.id }, { StaffTeamGuildOwner: interaction.values[0] });
 * ```
 */
export async function UpdateEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"], partial_entity: QueryDeepPartialEntity<T>): Promise<void> {
    if (!Database.isInitialized) await DatabaseConnect();

    await Database.manager.update(entity, criteria, partial_entity);
};