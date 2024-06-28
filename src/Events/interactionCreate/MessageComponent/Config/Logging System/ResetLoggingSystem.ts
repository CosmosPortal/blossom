import { ButtonBuilder, ChannelSelectMenuBuilder, GuildChannelExist } from "@cosmosportal/blossom.utils";
import { ButtonStyle, ChannelType, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, LoggingSetting, Sentry, UpdateEntity } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ResetLoggingSystem")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const custom_id = interaction.customId.split("_")[1] as "ModerationPrivateLogChannel" | "ModerationPublicLogChannel";

    await UpdateEntity(LoggingSetting, { Snowflake: interaction.guild.id }, { [custom_id]: "0" });

    const logging_setting = await FindOrCreateEntity(LoggingSetting, { Snowflake: interaction.guild.id });
    const log_channel = logging_setting[custom_id] === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, logging_setting[custom_id]) ? `<#${logging_setting[custom_id]}>` : "Channel no longer available.";
    const labels = {
        ModerationPrivateLogChannel: "Private Moderation Log Channel",
        ModerationPublicLogChannel: "Public Moderation Log Channel"
    };

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **${labels[custom_id]}** • ${log_channel}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ChannelSelectMenuBuilder({
        custom_id: `EditLoggingChannel_${custom_id}`,
        channel_types: [ ChannelType.GuildAnnouncement, ChannelType.GuildText ],
        placeholder: `Select a ${labels[custom_id].toLowerCase()}`,
    }).BuildActionRow();

    const action_row_two = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginLoggingSystemPage2",
        style: ButtonStyle.Secondary,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: `ResetLoggingSystem_${custom_id}`,
        style: ButtonStyle.Secondary,
        disabled: logging_setting[custom_id] === "0",
        label: "Reset?"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal/blossom#readme",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};