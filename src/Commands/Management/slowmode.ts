import { ChatInputCommandBuilder, HasChannelPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ChannelType, PermissionsBitField } from "discord.js";
import { Blossom, FormatTime, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "slowmode",
    description: "Edits a channel's slowmode",
    options: [
        {
            name: "seconds",
            description: "The slowmode cooldown in seconds",
            type: ApplicationCommandOptionType.Integer,
            max_value: 21600,
            required: true
        },
        {
            name: "channel",
            description: "The channel to edit the slowmode",
            type: ApplicationCommandOptionType.Channel,
            channel_types: [ ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice ]
        },
        {
            name: "reason",
            description: "The reason for editing the channel's slowmode",
            type: ApplicationCommandOptionType.String,
            max_length: 250,
            min_length: 5
        }
    ],
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", false, [ ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice ]) ?? interaction.channel;
    if (!channel) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the channel. The channel either no longer exist or ${client.user.username} couldn't fetch the channel.`);
    if (!await HasChannelPermissions(client, channel.id, client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName}:${interaction.commandId}>. Ensure ${client.user.username} has **View Channel** and **Manage Channels** permission in <#${channel.id}>.`);

    const reason = interaction.options.getString("reason", false);
    await channel.setRateLimitPerUser(interaction.options.getInteger("seconds", true), reason ? `${reason} • ${interaction.user.tag}` : `No reason was provided for the slowmode change by ${interaction.user.tag}`);

    return void await interaction.followUp({ content: `The slowmode for <#${channel.id}> was modified to ${FormatTime(interaction.options.getInteger("seconds", true), ", ")} in **${interaction.guild.name}**!`, ephemeral: true });
};