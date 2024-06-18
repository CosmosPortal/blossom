import { Database } from "../../Classes";
import { DatabaseConnect } from "./DatabaseConnect";
import { MemberID } from "../../Entities";
import { FindOrCreateEntity } from "./FindOrCreateEntity";
import type { MemberIDTypes, Snowflake } from "../../Types";

/**
 * Updates a value from MemberID
 * @param {Snowflake} snowflake - The snowflake to update the MemberID value
 * @param {MemberIDTypes} type - The type of MemberID value
 * @param {boolean} remove - Whether to decrease the value
 * 
 * @example
 * ```ts
 * const remove_warning = await UpdateMemberID(`${interaction.user.id}_${interaction.guild.id}`, "WarnInfraction", true);
 * ```
 */
export async function UpdateMemberID(snowflake: Snowflake, type: MemberIDTypes, remove: boolean = false): Promise<number> {
    if (!Database.isInitialized) await DatabaseConnect();
    const data = await FindOrCreateEntity(MemberID, { Snowflake: snowflake })
    const current_amount = !remove ? data[type] - 1 : data[type] + 1;
    await Database.manager.update(MemberID, { Snowflake: snowflake }, { [type]: current_amount });

    return current_amount;
};