import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, LoggingSetting, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPluginLoggingSystemPage1") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const logging_setting = await FindOrCreateEntity(LoggingSetting, { Snowflake: interaction.guild.id });

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Private Moderation Log** • ${logging_setting.ModerationPrivateLogStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}\n- **Public Moderation Log** • ${logging_setting.ModerationPublicLogStatus ? "<:Enabled:1250495120806121575>" : "<:Disabled:1250495173750816890>"}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginLoggingSystemPage1",
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
        custom_id: "ViewPluginLoggingSystemPage2",
        style: ButtonStyle.Primary,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "EditLoggingSystemToggle",
        select_options: [
            {
                label: `Private Moderation Log • ${logging_setting.ModerationPrivateLogStatus ? "Disable?" : "Enable?"}`,
                value: "ModerationPrivateLogStatus",
                description: "Whether to send private moderation logs"
            },
            {
                label: `Public Moderation Log • ${logging_setting.ModerationPublicLogStatus ? "Disable?" : "Enable?"}`,
                value: "ModerationPublicLogStatus",
                description: "Whether to send public moderation logs"
            }
        ],
        max_values: 2,
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