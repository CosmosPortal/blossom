import { ButtonManager, StringSelectMenuManager } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, GuildModerationSetting, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit) {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPage1ModerationPlugin") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return;
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { snowflake: interaction.guild.id });

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Appeal** • ${guild_moderation_setting.AppealLinkStatus ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}\n- **Confirmation Message** • ${guild_moderation_setting.ModerationConfirmationMessage ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}\n- **Private Log** • ${guild_moderation_setting.ModerationPrivateLogStatus ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}\n- **Public Log** • ${guild_moderation_setting.ModerationPublicLogStatus ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}\n- **Report Message** • ${guild_moderation_setting.ReportMessageStatus ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}\n- **Report User** • ${guild_moderation_setting.ReportUserStatus ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}\n- **Require Reason** • ${guild_moderation_setting.RequireReason ? "<:ToggleEnabled:1250219787607605358>" : "<:ToggleDisabled:1250219786529411163>"}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonManager()
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
    })
    .BuildActionRow();

    const action_row_two = new StringSelectMenuManager()
    .CreateSelectMenu({
        custom_id: "ModerationPluginManageToggles",
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
                label: `Report Message • ${guild_moderation_setting.ReportMessageStatus ? "Disable?" : "Enable?"}`,
                value: "ReportMessageStatus",
                description: "Enable or disable the report message system"
            },
            {
                label: `Report User • ${guild_moderation_setting.ReportUserStatus ? "Disable?" : "Enable?"}`,
                value: "ReportUserStatus",
                description: "Enable or disable the report user system"
            },
            {
                label: `Require Reason • ${guild_moderation_setting.RequireReason ? "Disable?" : "Enable?"}`,
                value: "RequireReason",
                description: "Require a reason for moderation commands"
            }
        ],
        max_values: 6,
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