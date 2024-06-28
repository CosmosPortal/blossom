import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, FormatTime, ModerationSetting, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "ViewPluginModeration") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const moderation_setting = await FindOrCreateEntity(ModerationSetting, { Snowflake: interaction.guild.id });

    if (interaction.values[0] === "BanDeleteMessagesHistory") {
        const embed_one = new EmbedBuilder()
        .setDescription(`## Overview\n- **Delete Message History for Ban** • **${moderation_setting.BanDeleteMessagesHistory}** days worth of messages.`)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new StringSelectMenuBuilder({
            custom_id: "EditModerationBanMessageHistory",
            select_options: [
                {
                    label: "7 Days",
                    value: "7",
                    default: moderation_setting.BanDeleteMessagesHistory === 7
                },
                {
                    label: "6 Days",
                    value: "6",
                    default: moderation_setting.BanDeleteMessagesHistory === 6
                },
                {
                    label: "5 Days",
                    value: "5",
                    default: moderation_setting.BanDeleteMessagesHistory === 5
                },
                {
                    label: "4 Days",
                    value: "4",
                    default: moderation_setting.BanDeleteMessagesHistory === 4
                },
                {
                    label: "3 Days",
                    value: "3",
                    default: moderation_setting.BanDeleteMessagesHistory === 3
                },
                {
                    label: "2 Days",
                    value: "2",
                    default: moderation_setting.BanDeleteMessagesHistory === 2
                },
                {
                    label: "1 Day",
                    value: "1",
                    default: moderation_setting.BanDeleteMessagesHistory === 1
                },
                {
                    label: "None",
                    value: "0",
                    default: moderation_setting.BanDeleteMessagesHistory === 0
                }
            ]
        }).BuildActionRow();

        const action_row_two = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "ViewPluginModerationPage2",
            style: ButtonStyle.Secondary,
            label: "Back"
        })
        .CreateRegularButton({
            custom_id: "ResetModerationBanMessageHistory",
            style: ButtonStyle.Secondary,
            disabled: moderation_setting.BanDeleteMessagesHistory === 0,
            label: "Reset?"
        })
        .CreateLinkButton({
            custom_id: "https://github.com/CosmosPortal/blossom#readme",
            style: ButtonStyle.Link,
            label: "Documentation"
        }).BuildActionRow();

        return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
    };

    if (interaction.values[0] === "TimeoutTimer") {
        const embed_one = new EmbedBuilder()
        .setDescription(`## Overview\n- **Timeout Timer** • ${FormatTime(moderation_setting.TimeoutTimer, ", ")}`)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new StringSelectMenuBuilder({
            custom_id: "EditModerationTimeoutTimer",
            select_options: [
                {
                    label: "1 Week",
                    value: "604800",
                    default: moderation_setting.TimeoutTimer === 604800
                },
                {
                    label: "1 Day",
                    value: "86400",
                    default: moderation_setting.TimeoutTimer === 86400
                },
                {
                    label: "1 Hour",
                    value: "3600",
                    default: moderation_setting.TimeoutTimer === 3600
                },
                {
                    label: "10 Minutes",
                    value: "600",
                    default: moderation_setting.TimeoutTimer === 600
                },
                {
                    label: "5 Minutes",
                    value: "300",
                    default: moderation_setting.TimeoutTimer === 300
                },
                {
                    label: "1 Minute",
                    value: "60",
                    default: moderation_setting.TimeoutTimer === 60
                }
            ]
        }).BuildActionRow();

        const action_row_two = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "ViewPluginModerationPage2",
            style: ButtonStyle.Secondary,
            label: "Back"
        })
        .CreateRegularButton({
            custom_id: "ResetModerationTimeoutTimer",
            style: ButtonStyle.Secondary,
            disabled: moderation_setting.TimeoutTimer === 3600,
            label: "Reset?"
        })
        .CreateLinkButton({
            custom_id: "https://github.com/CosmosPortal/blossom#readme",
            style: ButtonStyle.Link,
            label: "Documentation"
        }).BuildActionRow();

        return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
    };
};