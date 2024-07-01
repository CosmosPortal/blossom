import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import type { FindOneOptions, ObjectType } from "typeorm";

/**
 * Deletes an entity data
 * @param {ObjectType<T>} entity - The entity to delete
 * @param {FindOneOptions<T>["where"]} criteria - Where it's located
 * 
 * @example
 * ```ts
 * await DeleteEntity(TagSystem, { Snowflake: guild.id, Name: "say-hey" });
 * ```
 */
export async function DeleteEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<void> {
    if (!Database.isInitialized) await DatabaseConnect();

    await Database.manager.delete(entity, criteria);
};