import { ChatInputCommandBuilder, HasChannelPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ChannelType, PermissionsBitField } from "discord.js";
import { Blossom, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "purge",
    description: "Deletes messages from a channel or user",
    options: [
        {
            name: "amount",
            description: "Deletes messages from the channel",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "amount",
                    description: "The amount of messages you want to delete",
                    type: ApplicationCommandOptionType.Integer,
                    max_value: 100,
                    min_value: 2,
                    required: true
                },
                {
                    name: "channel",
                    description: "The channel to delete messages from",
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread ],
                }
            ]
        },
        {
            name: "user",
            description: "Deletes messages from a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user you want to delete messages from",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "amount",
                    description: "The amount of messages you want to delete",
                    type: ApplicationCommandOptionType.Integer,
                    max_value: 100,
                    min_value: 2,
                    required: true
                },
                {
                    name: "channel",
                    description: "The channel to delete messages from",
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread ],
                }
            ]
        }
    ],
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId} ${interaction.options.getSubcommand()}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel", false, [ ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread ]) ?? interaction.channel;
    if (!channel) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the channel. The channel either no longer exist or ${client.user.username} couldn't fetch the channel.`);
    if (!HasChannelPermissions(client, channel.id, client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Ensure ${client.user.username} has **View Channel** and **Manage Messages** permission in <#${channel.id}>.`);

    const channel_messages = await channel.messages.fetch({ limit: 100 });
    const filter_messages = [...channel_messages.filter((x) => !x.pinned).values()];

    if (interaction.options.getSubcommand() === "amount") {
        const amount_deleted = await channel.bulkDelete(filter_messages.slice(0, interaction.options.getInteger("amount", true)), true);
        if (amount_deleted.size === 0) return void await interaction.followUp({ content: `It seems like <#${channel.id}> doesn't have any messages or the messages are over 2 weeks old.`, ephemeral: true });

        return void await interaction.followUp({ content: `You have deleted **${amount_deleted.size}** messages in <#${channel.id}>.`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "user") {
        const user = interaction.options.getUser("user", true);
        const filter_messages_user = filter_messages.filter((x) => x.author.id === user.id);
        const amount_deleted = await channel.bulkDelete(filter_messages_user.slice(0, interaction.options.getInteger("amount", true)), true);
        if (amount_deleted.size === 0) return void await interaction.followUp({ content: `It seems like <@${user.id}> doesn't have any messages in <#${channel.id}> or the messages are over 2 weeks old.`, ephemeral: true });

        return void await interaction.followUp({ content: `You have deleted **${amount_deleted.size}** messages belonging to <@${user.id}> in <#${channel.id}>.`, ephemeral: true });
    };
};