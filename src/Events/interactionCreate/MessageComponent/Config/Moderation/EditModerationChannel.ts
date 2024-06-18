import { ChannelSelectMenuBuilder, GuildChannelExist } from "@cosmosportal/blossom.utils";
import { ChannelType, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, GuildModerationSetting, Sentry, UpdateEntity, type GuildModerationSettingChannel } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChannelSelectMenu() || !interaction.customId.startsWith("EditModerationChannel")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const custom_id = interaction.customId.split("_")[1] as GuildModerationSettingChannel;
    const old_guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });

    await UpdateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id }, { [custom_id]: old_guild_moderation_setting[custom_id] === "0" ? interaction.values[0] : interaction.values[0] === old_guild_moderation_setting[custom_id] ? "0" : interaction.values[0] });

    const new_guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });
    const channel = new_guild_moderation_setting[custom_id] === "0" ? "Add Channel?" : await GuildChannelExist(interaction.guild, new_guild_moderation_setting[custom_id]) ? `<#${new_guild_moderation_setting[custom_id]}>` : "Channel no longer available.";
    const feature_label = {
        MessageReportChannel: "Message Report Channel",
        ModerationPrivateLogChannel: "Private Log Channel",
        ModerationPublicLogChannel: "Public Log Channel",
        UserReportChannel: "User Report Channel"
    };

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **${feature_label[custom_id]}** • ${channel}\n\nIn order to remove a channel, reselect the set channel.`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ChannelSelectMenuBuilder({
        custom_id: `EditModerationChannel_${custom_id}`,
        channel_types: [ ChannelType.GuildAnnouncement, ChannelType.GuildText ],
        placeholder: `Select a ${feature_label[custom_id].toLowerCase()}`,
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one] });
};