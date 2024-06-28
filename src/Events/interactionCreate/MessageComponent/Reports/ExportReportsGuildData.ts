import { AttachmentBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { ActionTypeName, Blossom, FindReport, FindOrCreateEntity, GuildID, Sentry, type ReportSystem, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ExportReportsGuildData")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const custom_id = interaction.customId.split("_");
    const type = custom_id[1] as ReportType;

    const guild_id = await FindOrCreateEntity(GuildID, { Snowflake: interaction.guild.id });
    const reports = await FindReport(interaction.guild.id, {
        is_inactive: true,
        type: type
    }) as ReportSystem[] | null;
    if (!reports) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any ${ActionTypeName[type].toLowerCase()} action IDs that exist.`);

    const data = reports.map((report) => {
        return {
            actionID: report.ActionID,
            active: report.Active,
            caseID: String(report.CaseID),
            creationTimestamp: report.CreationTimestamp,
            evidenceAttachmentURL: report.EvidenceAttachmentURL ? report.EvidenceAttachmentURL : null,
            flaggedChannelID: report.FlaggedChannelID ? report.FlaggedChannelID : null,
            flaggedMessageID: report.FlaggedMessageID ? report.FlaggedMessageID : null,
            hasBanAddLogged: report.HasBanAddLogged,
            hasKickLogged: report.HasKickLogged,
            hasTimeoutAddLogged: report.HasTimeoutAddLogged,
            hasWarnAddLogged: report.HasWarnAddLogged,
            hasWarnVerbalLogged: report.HasWarnVerbalLogged,
            isMessageDeleted: report.IsMessageDeleted,
            reason: report.Reason,
            reportChannelID: report.ReportChannelID,
            reportMessageID: report.ReportMessageID,
            reporterID: "anonymous",
            reporterUsername: "anonymous",
            targetID: report.TargetID,
            targetUsername: report.TargetUsername,
            type: report.Type
        }
    });

    const format = {
        guild_name: interaction.guild.name,
        guild_id: interaction.guild.id,
        total_reports: String(guild_id.ReportCreation),
        report_data: data
    };

    const file_one = new AttachmentBuilder(Buffer.from(JSON.stringify(format, null, 2)), { name: `${interaction.guild.id}.json` });

    return void await interaction.followUp({ content: `Exported report data belonging to ${interaction.guild.name}. Some data are marked as "anonymous" for privacy.`, files: [file_one], ephemeral: true });
};