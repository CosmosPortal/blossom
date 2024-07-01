import { Database } from "../../Classes";
import { DatabaseConnect } from "../Database";
import { ReportSystem } from "../../Entities";
import type { FindReportData } from "../../Interfaces";
import type { Snowflake } from "../../Types";

/**
 * Finds a report in a guild
 * @param {Snowflake} guild_id - The guild ID the report belongs in
 * @param {FindReportData} data - The structure of data to filter
 * 
 * @example
 * ```ts
 * console.log(await FindReport(guild.id, { is_inactive: true }));
 * ```
 */
export async function FindReport(guild_id: Snowflake, data: FindReportData = {}): Promise<ReportSystem | ReportSystem[] | null> {
    if (!Database.isInitialized) await DatabaseConnect();

    let infractions = Database.manager.createQueryBuilder(ReportSystem, "ReportSystem")
    .leftJoinAndSelect("ReportSystem.Guild", "Guild")
    .where("ReportSystem.Guild_ID = :Guild_ID", { Guild_ID: guild_id })

    if (data.blossom_id) infractions = infractions.andWhere("ReportSystem.BlossomID = :BlossomID", { BlossomID: data.blossom_id });
    if (data.from_member) infractions = infractions.andWhere("ReportSystem.ReporterID = :ReporterID", { ReporterID: data.from_member });
    if (!data.is_inactive) infractions = infractions.andWhere("ReportSystem.Active = :Active", { Active: true });
    if (data.type) infractions = infractions.andWhere("ReportSystem.Type = :Type", { Type: data.type });
    if (data.return_one) return await infractions.getOne();

    const infraction_data = await infractions.getMany();
    return infraction_data.length === 0 ? null : infraction_data;
};