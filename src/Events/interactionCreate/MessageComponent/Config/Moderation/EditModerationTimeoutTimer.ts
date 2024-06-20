import { StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, FormatTime, GuildModerationSetting, Sentry, UpdateEntity } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "EditModerationTimeoutTimer") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    await UpdateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id }, { TimeoutTimer: Number(interaction.values[0]) });

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n- **Timeout Timer** • ${FormatTime(guild_moderation_setting.TimeoutTimer, ", ")}`)
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

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one] });
};