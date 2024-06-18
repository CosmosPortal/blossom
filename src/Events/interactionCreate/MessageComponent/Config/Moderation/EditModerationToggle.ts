import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, GuildModerationSetting, Sentry, UpdateTogglePlugin } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "EditModerationToggle") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    await UpdateTogglePlugin(GuildModerationSetting, { Snowflake: interaction.guild.id }, interaction.values);
    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Appeal** • ${guild_moderation_setting.AppealLinkStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Confirmation Message** • ${guild_moderation_setting.ModerationConfirmationMessage ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Message Report** • ${guild_moderation_setting.MessageReportStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Private Log** • ${guild_moderation_setting.ModerationPrivateLogStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Public Log** • ${guild_moderation_setting.ModerationPublicLogStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Require Reason** • ${guild_moderation_setting.RequireReason ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **User Report** • ${guild_moderation_setting.UserReportStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPage1ModerationPlugin",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: "undefined",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "1/2"
    })
    .CreateRegularButton({
        custom_id: "ViewPage2ModerationPlugin",
        style: ButtonStyle.Primary,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "EditModerationToggle",
        select_options: [
            {
                label: `Appeal • ${guild_moderation_setting.AppealLinkStatus ? "Disable?" : "Enable?"}`,
                value: "AppealLinkStatus",
                description: "Whether to have the appeal link sent with DM logs"
            },
            {
                label: `Confirmation Message • ${guild_moderation_setting.ModerationConfirmationMessage ? "Disable?" : "Enable?"}`,
                value: "ModerationConfirmationMessage",
                description: "Whether to show a moderation confirmation message"
            },
            {
                label: `Message Report • ${guild_moderation_setting.MessageReportStatus ? "Disable?" : "Enable?"}`,
                value: "MessageReportStatus",
                description: "Enable or disable the Message Report system"
            },
            {
                label: `Private Log • ${guild_moderation_setting.ModerationPrivateLogStatus ? "Disable?" : "Enable?"}`,
                value: "ModerationPrivateLogStatus",
                description: "Whether to send private moderation logs"
            },
            {
                label: `Public Log • ${guild_moderation_setting.ModerationPublicLogStatus ? "Disable?" : "Enable?"}`,
                value: "ModerationPublicLogStatus",
                description: "Whether to send public moderation logs"
            },
            {
                label: `Require Reason • ${guild_moderation_setting.RequireReason ? "Disable?" : "Enable?"}`,
                value: "RequireReason",
                description: "Require a reason for moderation commands"
            },
            {
                label: `User Report • ${guild_moderation_setting.UserReportStatus ? "Disable?" : "Enable?"}`,
                value: "UserReportStatus",
                description: "Enable or disable the User Report system"
            }
        ],
        max_values: 7,
        placeholder: "Pick a setting to edit"
    }).BuildActionRow();

    const action_row_three = new ButtonBuilder()
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
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};