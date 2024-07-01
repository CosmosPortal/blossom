import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import type { DeepPartial, FindOneOptions, ObjectType } from "typeorm";

/**
 * Finds one entity, if entity is not found, creates it
 * @param {ObjectType<T>} entity - The entity to find
 * @param {FindOneOptions<T>["where"]} criteria - Where it's located
 * 
 * @example
 * ```ts
 * console.log(await FindOrCreateEntity(RoleManager, { Snowflake: guild.id }));
 * ```
 */
export async function FindOrCreateEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<T> {
    if (!Database.isInitialized) await DatabaseConnect();
    const data = await Database.manager.findOne(entity, { where: criteria });
    if (data) return data as T;

    const new_data = Database.manager.create(entity, criteria as DeepPartial<T>);
    await Database.manager.save(new_data);

    return new_data;
};