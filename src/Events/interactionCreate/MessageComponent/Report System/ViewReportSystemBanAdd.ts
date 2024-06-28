import { CompareRolePosition, MemberBannedStatus, MemberHasPermissions, ModalBuilder } from "@cosmosportal/blossom.utils";
import { PermissionsBitField, TextInputStyle, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOneEntity, FindOrCreateEntity, ModerationSetting, ReportSystem, Sentry } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewReportSystemBanAdd") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const report_system = await FindOneEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id });
    if (!report_system) return void await Blossom.CreateInteractionError(interaction, `I couldn't find the report information. This could be due to the report no longer existing in ${client.user.username}'s database.`);

    const user = await client.users.fetch(report_system.TargetID).catch(() => { return undefined });
    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

    if (!report_system.Active) return void await Blossom.CreateInteractionError(interaction, "This report has been marked as inactive.");
    if (report_system.HasBanAddLogged) return void await Blossom.CreateInteractionError(interaction, "This action has already been executed in this report.");
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.BanMembers ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run this feature. Ensure ${client.user.username} has **Ban Members** permission in ${interaction.guild.name}.`);
    if (user.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on yourself.`);
    if (user.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on ${client.user.username}.`);
    if (user.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `The reported member has a higher role than ${client.user.username}.`);
    if (await MemberBannedStatus(interaction.guild, user.id)) return void await Blossom.CreateInteractionError(interaction, `The reported user is already banned in ${interaction.guild.name}.`);

    const moderation_setting = await FindOrCreateEntity(ModerationSetting, { Snowflake: interaction.guild.id });

    const modal_response = new ModalBuilder({
        custom_id: "TriggerReportSystemBanAdd",
        title: "Report System | Ban Add"
    })
    .CreateTextInput({
        custom_id: "reason",
        label: "The reason for the ban",
        style: TextInputStyle.Paragraph,
        max_length: 250,
        min_length: 5,
        placeholder: "Please provide a reason for the ban",
        required: moderation_setting.RequireReason
    }).BuildResponse();

    return void await interaction.showModal(modal_response);
};