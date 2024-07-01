import { ButtonBuilder, GuildChannelExist, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, LoggingSetting, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPluginLoggingSystemPage2") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const logging_setting = await FindOrCreateEntity(LoggingSetting, { Snowflake: interaction.guild.id });
    const private_moderation_log_channel = logging_setting.ModerationPrivateLogChannel === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, logging_setting.ModerationPrivateLogChannel) ? `<#${logging_setting.ModerationPrivateLogChannel}>` : "Channel no longer available.";
    const public_moderation_log_channel = logging_setting.ModerationPublicLogChannel === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, logging_setting.ModerationPublicLogChannel) ? `<#${logging_setting.ModerationPublicLogChannel}>` : "Channel no longer available.";

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Private Moderation Log Channel** • ${private_moderation_log_channel}\n- **Public Moderation Log Channel** • ${public_moderation_log_channel}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginLoggingSystemPage1",
        style: ButtonStyle.Primary,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: "undefined",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "2/2"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginLoggingSystemPage2",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "ViewPluginLoggingSystem",
        select_options: [
            {
                label: "Private Moderation Log",
                value: "ModerationPrivateLogChannel"
            },
            {
                label: "Public Moderation Log",
                value: "ModerationPublicLogChannel"
            }
        ],
        placeholder: "Pick a setting to edit"
    }).BuildActionRow();

    const action_row_three = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginHome",
        style: ButtonStyle.Secondary,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal/blossom#readme",
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};