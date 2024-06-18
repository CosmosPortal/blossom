import type { FindOneOptions, ObjectType } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import type { ObjectMap } from "../../Interfaces";
import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { FindOrCreateEntity } from "./FindOrCreateEntity";

/**
 * Enables or disable a plugin toggle value
 * @param {ObjectType<T>} entity - The entity to update
 * @param {FindOneOptions<T>["where"]} criteria - Where it's located
 * @param {string[]} values - The toggle features to update
 * 
 * @example
 * ```ts
 * await UpdateTogglePlugin(GuildModerationSetting, { Snowflake: interaction.guild.id }, interaction.values);
 * ```
 */
export async function UpdateTogglePlugin<T extends ObjectMap>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"], values: string[]): Promise<void> {
    if (!Database.isInitialized) await DatabaseConnect();

    const data = await FindOrCreateEntity(entity, criteria);

    for (const value of values) {
        const current_value = data[value] ?? false;
        const updated_value = { [value]: !current_value } as unknown as QueryDeepPartialEntity<T>;

        await Database.manager.update(entity, criteria, updated_value);
    };
};