import { ButtonBuilder, CompareDate, HasChannelPermissions } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, PermissionsBitField, type Client, type GuildTextBasedChannel, type MessageComponentInteraction } from "discord.js";
import { setTimeout } from "timers/promises";
import { ActionName, Blossom, FindOneEntity, ReportSystem, Sentry, UpdateEntity, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "TriggerReportSystemDeleteMessage") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    if (!interaction.message) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the message. The message either no longer exist or ${client.user.username} couldn't fetch the message.`)

    const report_system = await FindOneEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id });
    if (!report_system) return void await Blossom.CreateInteractionError(interaction, `I couldn't find the report information. This could be due to the report no longer existing in ${client.user.username}'s database.`);

    const channel = await interaction.guild.channels.fetch(report_system.FlaggedChannelID).catch(() => { return undefined }) as GuildTextBasedChannel | undefined;
    if (!channel) return void await Blossom.CreateInteractionError(interaction, `The channel the reported message is from either no longer exist or ${client.user.username} couldn't fetch the channel.`);

    const message = await channel.messages.fetch(report_system.FlaggedMessageID).catch(() => { return undefined });
    if (!message) return void await Blossom.CreateInteractionError(interaction, `The reported message either no longer exist or ${client.user.username} couldn't fetch the message.`);

    if (!report_system.Active) return void await Blossom.CreateInteractionError(interaction, "This report has been marked as inactive.");
    if (report_system.IsMessageDeleted) return void await Blossom.CreateInteractionError(interaction, "This action has already been executed in this report.");
    if (CompareDate(message.createdTimestamp, Date.now()) > 5) return void await Blossom.CreateInteractionError(interaction, "You cannot report a message older than 5 days.");
    if (!await HasChannelPermissions(client, channel.id, client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageMessages ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run this feature. Ensure ${client.user.username} has **View Channel** and **Manage Messages** permission in <#${channel.id}>.`);
    if (!message.deletable) return void await Blossom.CreateInteractionError(interaction, `The reported message is not deletable in <#${channel.id}>.`);

    await interaction.deferUpdate();

    const creation_timestamp = Date.now()
    await message.delete();
    await UpdateEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id }, { IsMessageDeleted: true });

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.message.embeds[0].thumbnail?.url ?? null)
    .setAuthor({ name: `Case #${report_system.CaseID} | ${ActionName[report_system.Type as ReportType]}` })
    .setDescription(interaction.message.embeds[0].description)
    .addFields(
        { name: "Reason", value: interaction.message.embeds[0].fields[0].value },
        { name: "Action Log", value: interaction.message.embeds[0].fields[1].value === "None" ? `- <@${interaction.user.id}> **deleted a message** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` : `${interaction.message.embeds[0].fields[1].value}\n- <@${interaction.user.id}> **deleted a message** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` }
    )
    .setImage(interaction.message.embeds[0].image?.url ?? null)
    .setFooter({ text: interaction.message.embeds[0].footer?.text ?? "An issue occured" })
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitReportSystem",
        style: ButtonStyle.Danger,
        label: "Dismiss Report"
    });

    if (report_system.Type === "MessageReport") action_row_one.CreateRegularButton({
        custom_id: "TriggerReportSystemDeleteMessage",
        style: ButtonStyle.Danger,
        disabled: true,
        label: "Delete Message"
    });

    action_row_one.CreateRegularButton({
        custom_id: "ViewReportSystemUserInfo",
        style: ButtonStyle.Secondary,
        label: "User Info"
    });

    const action_row_two = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewReportSystemBanAdd",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasBanAddLogged,
        label: "Ban"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemKick",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasKickLogged,
        label: "Kick"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemTimeout",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasTimeoutAddLogged,
        label: "Timeout"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemWarnAdd",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasWarnAddLogged,
        label: "Warn"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemWarnVerbal",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasWarnVerbalLogged,
        label: "Verbal Warn"
    }).BuildActionRow();

    await interaction.editReply({ content: interaction.message.content, embeds: [embed_one], components: [action_row_one.BuildActionRow(), action_row_two], allowedMentions: { parse: [ "roles" ] } });
    await setTimeout(300);
    return void await interaction.followUp({ content: `The reported message was deleted in <#${channel.id}>!`, ephemeral: true });
};