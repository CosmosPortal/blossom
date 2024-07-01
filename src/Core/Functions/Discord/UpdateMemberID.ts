import { Database } from "../../Classes";
import { DatabaseConnect, FindOrCreateEntity } from "../Database";
import { MemberID } from "../../Entities";
import type { MemberIDTypes, Snowflake } from "../../Types";

/**
 * Updates a value from MemberID
 * @param {Snowflake} snowflake - The snowflake to update the MemberID value
 * @param {MemberIDTypes} type - The type of MemberID value
 * @param {boolean} remove - Whether to decrease the value
 * 
 * @example
 * ```ts
 * console.log(await UpdateMemberID(`${user.id}_${guild.id}`, "WarnInfraction", true));
 * ```
 */
export async function UpdateMemberID(snowflake: Snowflake, type: MemberIDTypes, remove: boolean = false): Promise<number> {
    if (!Database.isInitialized) await DatabaseConnect();

    const data = await FindOrCreateEntity(MemberID, { Snowflake: snowflake })
    const current_amount = !remove ? data[type] - 1 : data[type] + 1;
    await Database.manager.update(MemberID, { Snowflake: snowflake }, { [type]: current_amount });

    return current_amount;
};