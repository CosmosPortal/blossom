import { CompareRolePosition, ContextMenuCommandBuilder, HasChannelPermissions, ModalBuilder } from "@cosmosportal/blossom.utils";
import { ApplicationCommandType, PermissionsBitField, TextInputStyle, type TextChannel } from "discord.js";
import { Blossom, CompareDate, FindOrCreateEntity, ReportSetting, Sentry } from "../../Core";
import type { CommandData, ContextMenuCommandProps } from "commandkit";

export const data: CommandData = new ContextMenuCommandBuilder({
    name: "Report Message",
    type: ApplicationCommandType.Message,
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: ContextMenuCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isMessageContextMenuCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    const report_setting = await FindOrCreateEntity(ReportSetting, { Snowflake: interaction.guild.id });
    const user = interaction.targetMessage.author;
    const report_channel = await interaction.guild.channels.fetch(report_setting.MessageReportChannel).catch(() => { return undefined }) as TextChannel | undefined;

    if (CompareDate(interaction.targetMessage.createdTimestamp, Date.now()) > 5) return void await Blossom.CreateInteractionError(interaction, "You cannot report a message older than 5 days.");
    if (!report_setting.MessageReportStatus) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} has the message report system disabled.`);
    if (!report_channel) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} does not have a message report channel set.`);
    if (!await HasChannelPermissions(client, report_channel.id, client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run **${interaction.commandName}**. Ensure ${client.user.username} has **View Channel**, **Send Messages**, and **Embed Links** permission in the message report channel.`);
    if (report_setting.MessageReportThreadMode && !await HasChannelPermissions(client, report_channel.id, client.user.id, [ PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run **${interaction.commandName}**. Ensure ${client.user.username} has **Send Messages in Threads** and **Create Public Threads** permission in the message report channel.`);
    if (await Blossom.IsGuildStaffMember(interaction.guild, user)) return void await Blossom.CreateInteractionError(interaction, `You cannot run **${interaction.commandName}** on a staff member of ${interaction.guild.name}.`);
    if (user.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run **${interaction.commandName}** on yourself.`);
    if (user.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run **${interaction.commandName}** on ${client.user.username}.`);
    if (user.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run **${interaction.commandName}** on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run **${interaction.commandName}** on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    const modal_response = new ModalBuilder({
        custom_id: `TriggerReportSystemCreate_Message_${user.id}_${interaction.targetMessage.channel.id}_${interaction.targetMessage.id}`,
        title: "Report System | Creator"
    })
    .CreateTextInput({
        custom_id: "reason",
        label: "The reason you are creating the report",
        style: TextInputStyle.Paragraph,
        max_length: 250,
        min_length: 5,
        placeholder: "Please provide a reason for the report",
        required: true
    }).BuildResponse();

    return void await interaction.showModal(modal_response);
};