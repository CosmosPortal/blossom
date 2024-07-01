import { CreateBlossomID } from "../Blossom";
import { Database } from "../../Classes";
import { DatabaseConnect, FindOrCreateEntity } from "../Database";
import { GuildSystem, ReportSystem } from "../../Entities";
import type { ReportCreation } from "../../Interfaces";

/**
 * Creates a report in a guild
 * @param {ReportCreation} data - The structure of data needed to create the report
 * 
 * @example
 * ```ts
 * const report = await CreateReport({
 *     Snowflake: guild.id,
 *     CaseID: 1,
 *     CreationTimestamp: Date.now(),
 *     EvidenceAttachmentURL: "https://example.com",
 *     FlaggedChannelID: channel.id,
 *     FlaggedMessageID: message.id,
 *     Reason: "Won't say hi back!",
 *     ReportChannelID: report_channel.id,
 *     ReportMessageID: report_message.id,
 *     ReporterID: user.id,
 *     TargetID: message.author.id,
 *     Type: "MessageReport"
 * });
 * ```
 */
export async function CreateReport(data: ReportCreation): Promise<ReportSystem> {
    if (!Database.isInitialized) await DatabaseConnect();

    const creation_timestamp = data.CreationTimestamp ?? Date.now();
    const guild_system = await FindOrCreateEntity(GuildSystem, { Snowflake: data.Snowflake });

    const report = new ReportSystem();
    report.Active = data.Active ?? true;
    report.BlossomID = data.BlossomID ?? CreateBlossomID(creation_timestamp);
    report.CaseID = data.CaseID;
    report.CreationTimestamp = creation_timestamp;
    report.EvidenceAttachmentURL = data.EvidenceAttachmentURL;
    report.FlaggedChannelID = data.FlaggedChannelID;
    report.FlaggedMessageID = data.FlaggedMessageID;
    report.Guild_ID = data.Snowflake;
    report.HasBanAddLogged = data.HasBanAddLogged ?? false;
    report.HasKickLogged = data.HasKickLogged ?? false;
    report.HasTimeoutAddLogged = data.HasTimeoutAddLogged ?? false;
    report.HasWarnAddLogged = data.HasWarnAddLogged ?? false;
    report.HasWarnVerbalLogged = data.HasWarnVerbalLogged ?? false;
    report.IsMessageDeleted = data.IsMessageDeleted ?? false;
    report.Reason = data.Reason;
    report.ReportChannelID = data.ReportChannelID;
    report.ReportMessageID = data.ReportMessageID;
    report.ReporterID = data.ReporterID;
    report.TargetID = data.TargetID;
    report.Type = data.Type;
    report.Guild = guild_system;
    await Database.manager.save(report);

    return report;
};