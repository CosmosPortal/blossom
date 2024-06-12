import { ButtonManager, CropText, GuildChannelExist, StringSelectMenuManager } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, FormatTimeout, GuildModerationSetting, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit) {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPage2ModerationPlugin") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return;
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { snowflake: interaction.guild.id });
    const private_log_channel = guild_moderation_setting.ModerationPrivateLogChannel === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, guild_moderation_setting.ModerationPrivateLogChannel) ? `<#${guild_moderation_setting.ModerationPrivateLogChannel}>` : "Channel no longer available.";
    const public_log_channel = guild_moderation_setting.ModerationPublicLogChannel === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, guild_moderation_setting.ModerationPublicLogChannel) ? `<#${guild_moderation_setting.ModerationPublicLogChannel}>` : "Channel no longer available.";
    const report_message_channel = guild_moderation_setting.ReportMessageChannel === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, guild_moderation_setting.ReportMessageChannel) ? `<#${guild_moderation_setting.ReportMessageChannel}>` : "Channel no longer available.";
    const report_user_channel = guild_moderation_setting.ReportUserChannel === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, guild_moderation_setting.ReportUserChannel) ? `<#${guild_moderation_setting.ReportUserChannel}>` : "Channel no longer available.";

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Appeal Link** • ${!guild_moderation_setting.AppealLink ? "No appeal link has been set." : CropText(guild_moderation_setting.AppealLink, 47, true)}\n- **Delete Message History for Ban** • **${guild_moderation_setting.BanDeleteMessagesHistory}** days worth of messages.\n- **Private Log Channel** • ${private_log_channel}\n- **Public Log Channel** • ${public_log_channel}\n- **Report Message Channel** • ${report_message_channel}\n- **Report User Channel** • ${report_user_channel}\n- **Timeout Timer** • ${FormatTimeout(guild_moderation_setting.TimeoutTimer, ", ")}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonManager()
    .CreateRegularButton({
        custom_id: "ViewPage1ModerationPlugin",
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
        custom_id: "ViewPage2ModerationPlugin",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Next"
    })
    .BuildActionRow();

    const action_row_two = new StringSelectMenuManager()
    .CreateSelectMenu({
        custom_id: "ModerationPluginManage",
        select_options: [
            {
                label: "Edit Appeal Link",
                value: "AppealLink"
            },
            {
                label: "Edit Delete Message History for Ban",
                value: "BanDeleteMessagesHistory"
            },
            {
                label: "Edit Private Log Channel",
                value: "ModerationPrivateLogChannel"
            },
            {
                label: "Edit Public Log Channel",
                value: "ModerationPublicLogChannel"
            },
            {
                label: "Edit Report Message Channel",
                value: "ReportMessageChannel"
            },
            {
                label: "Edit Report User Channel",
                value: "ReportUserChannel"
            },
            {
                label: "Edit Timeout Timer",
                value: "EditTimeoutTimer"
            }
        ],
        placeholder: "Pick a setting to edit"
    })
    .BuildActionRow();

    const action_row_three = new ButtonManager()
    .CreateRegularButton({
        custom_id: "ExitPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal",
        style: ButtonStyle.Link,
        label: "Documentation"
    })
    .BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};