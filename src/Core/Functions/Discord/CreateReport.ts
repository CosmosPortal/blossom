import { Database } from "../../Classes";
import { DatabaseConnect, FindOrCreateEntity } from "../Database";
import { GuildSystem, ReportSystem } from "../../Entities";
import type { ReportCreation } from "../../Interfaces";

/**
 * Creates a report
 * @param {ReportCreation} data - The structure of data needed to create the report
 * 
 * @example
 * ```ts
 * const report = await CreateReport({
 *     Snowflake: interaction.guild.id,
 *     ActionID: "2024-06-24-1000",
 *     Active: true,
 *     CaseID: 1,
 *     CreationTimestamp: String(Date.now()),
 *     EvidenceAttachmentURL: "https://example.com",
 *     FlaggedChannelID: "123456789123456789",
 *     FlaggedMessageID: "123456789123456789",
 *     HasBanAddLogged: false,
 *     HasKickLogged: false,
 *     HasTimeoutAddLogged: false,
 *     HasWarnAddLogged: false,
 *     HasWarnVerbalLogged: false,
 *     IsMessageDeleted: false,
 *     Reason: "Won't say hi back!",
 *     ReportChannelID: "123456789123456789",
 *     ReportMessageID: "123456789123456789",
 *     ReporterID: "123456789123456789",
 *     ReporterUsername: "SomeRandomUsername",
 *     TargetID: "123456789123456789",
 *     TargetUsername: "SomeOtherRandomUsername",
 *     Type: "MessageReport"
 * });
 * ```
 */
export async function CreateReport(data: ReportCreation): Promise<ReportSystem> {
    if (!Database.isInitialized) await DatabaseConnect();

    const guild_system = await FindOrCreateEntity(GuildSystem, { Snowflake: data.Snowflake });
    const report = new ReportSystem();
    report.ActionID = data.ActionID;
    report.Active = data.Active;
    report.CaseID = data.CaseID;
    report.CreationTimestamp = data.CreationTimestamp;
    report.EvidenceAttachmentURL = data.EvidenceAttachmentURL;
    report.FlaggedChannelID = data.FlaggedChannelID;
    report.FlaggedMessageID = data.FlaggedMessageID;
    report.Guild_ID = data.Snowflake;
    report.HasBanAddLogged = data.HasBanAddLogged;
    report.HasKickLogged = data.HasKickLogged;
    report.HasTimeoutAddLogged = data.HasTimeoutAddLogged;
    report.HasWarnAddLogged = data.HasWarnAddLogged;
    report.HasWarnVerbalLogged = data.HasWarnVerbalLogged;
    report.IsMessageDeleted = data.IsMessageDeleted;
    report.Reason = data.Reason;
    report.ReportChannelID = data.ReportChannelID;
    report.ReportMessageID = data.ReportMessageID;
    report.ReporterID = data.ReporterID;
    report.ReporterUsername = data.ReporterUsername;
    report.TargetID = data.TargetID;
    report.TargetUsername = data.TargetUsername;
    report.Type = data.Type;
    report.Guild = guild_system;
    await Database.manager.save(report);

    return report;
};