import { FindOneOptions, ObjectType } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { FindOrCreateEntity } from "./FindOrCreateEntity";
import { ObjectMap } from "../../Interfaces";

export async function UpdateTogglePlugin<T extends ObjectMap>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"], values: string[]) {
    if (!Database.isInitialized) await DatabaseConnect();

    let data = await FindOrCreateEntity(entity, criteria);

    for (const value of values) {
        const current_value = data[value] ?? false;
        const updated_value = { [value]: !current_value } as unknown as QueryDeepPartialEntity<T>;

        await Database.manager.update(entity, criteria, updated_value);
    };
};