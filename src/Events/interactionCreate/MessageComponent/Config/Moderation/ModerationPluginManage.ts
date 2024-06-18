import { ChannelSelectMenuBuilder, GuildChannelExist, ModalBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ChannelType, EmbedBuilder, TextInputStyle, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, FormatTimeout, GuildModerationSetting, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "ModerationPluginManage") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });

    if (interaction.values[0] === "AppealLink") {
        const modal_response = new ModalBuilder({
            custom_id: "EditModerationAppealLink",
            title: "Appeal System | Editor"
        })
        .CreateTextInput({
            custom_id: "appeal_link",
            label: "Appeal Link",
            style: TextInputStyle.Short,
            max_length: 100,
            min_length: 8,
            placeholder: "Enter your link here or use {remove} to remove your link",
            required: true,
            value: !guild_moderation_setting.AppealLink ? undefined : guild_moderation_setting.AppealLink
        }).BuildResponse();

        return void await interaction.showModal(modal_response);
    };

    if (interaction.values[0] === "BanDeleteMessagesHistory") {
        await interaction.deferReply({ ephemeral: true });

        const embed_one = new EmbedBuilder()
        .setDescription(`## Overview\n- **Delete Message History for Ban** • **${guild_moderation_setting.BanDeleteMessagesHistory}** days worth of messages.`)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new StringSelectMenuBuilder({
            custom_id: "EditModerationBanMessageHistory",
            select_options: [
                {
                    label: "7 Days",
                    value: "7",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 7
                },
                {
                    label: "6 Days",
                    value: "6",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 6
                },
                {
                    label: "5 Days",
                    value: "5",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 5
                },
                {
                    label: "4 Days",
                    value: "4",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 4
                },
                {
                    label: "3 Days",
                    value: "3",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 3
                },
                {
                    label: "2 Days",
                    value: "2",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 2
                },
                {
                    label: "1 Day",
                    value: "1",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 1
                },
                {
                    label: "None",
                    value: "0",
                    default: guild_moderation_setting.BanDeleteMessagesHistory === 0
                }
            ]
        }).BuildActionRow();

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one], ephemeral: true });
    };

    if (interaction.values[0] === "MessageReportChannel" || interaction.values[0] === "ModerationPrivateLogChannel" || interaction.values[0] === "ModerationPublicLogChannel" || interaction.values[0] === "UserReportChannel") {
        await interaction.deferReply({ ephemeral: true });

        const channel = guild_moderation_setting[interaction.values[0]] === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, guild_moderation_setting[interaction.values[0]]) ? `<#${guild_moderation_setting[interaction.values[0]]}>` : "Channel no longer available.";
        const feature_label = {
            MessageReportChannel: "Message Report Channel",
            ModerationPrivateLogChannel: "Private Log Channel",
            ModerationPublicLogChannel: "Public Log Channel",
            UserReportChannel: "User Report Channel"
        };

        const embed_one = new EmbedBuilder()
        .setDescription(`## Overview\n- **${feature_label[interaction.values[0]]}** • ${channel}\n\nIn order to remove a channel, reselect the set channel.`)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new ChannelSelectMenuBuilder({
            custom_id: `EditModerationChannel_${interaction.values[0]}`,
            channel_types: [ ChannelType.GuildAnnouncement, ChannelType.GuildText ],
            placeholder: `Select a ${feature_label[interaction.values[0]].toLowerCase()}`,
        }).BuildActionRow();

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one], ephemeral: true });
    };

    if (interaction.values[0] === "TimeoutTimer") {
        await interaction.deferReply({ ephemeral: true });

        const embed_one = new EmbedBuilder()
        .setDescription(`## Overview\n- **Timeout Timer** • ${FormatTimeout(guild_moderation_setting.TimeoutTimer, ", ")}`)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new StringSelectMenuBuilder({
            custom_id: "EditModerationTimeoutTimer",
            select_options: [
                {
                    label: "1 Week",
                    value: "604800",
                    default: guild_moderation_setting.TimeoutTimer === 604800
                },
                {
                    label: "1 Day",
                    value: "86400",
                    default: guild_moderation_setting.TimeoutTimer === 86400
                },
                {
                    label: "1 Hour",
                    value: "3600",
                    default: guild_moderation_setting.TimeoutTimer === 3600
                },
                {
                    label: "10 Minutes",
                    value: "600",
                    default: guild_moderation_setting.TimeoutTimer === 600
                },
                {
                    label: "5 Minutes",
                    value: "300",
                    default: guild_moderation_setting.TimeoutTimer === 300
                },
                {
                    label: "1 Minute",
                    value: "60",
                    default: guild_moderation_setting.TimeoutTimer === 60
                }
            ]
        }).BuildActionRow();

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one], ephemeral: true });
    };
};