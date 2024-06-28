import { ChatInputCommandBuilder, GuildChannelCount, MemberBannedStatus } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ChannelType, EmbedBuilder } from "discord.js";
import { AppealSetting, Blossom, DiscordBadges, FindOrCreateEntity, FormatTime, GuildID, MemberID, ModerationSetting, RoleManager, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "info",
    description: "Provides information about a server and user",
    options: [
        {
            name: "server",
            description: "Provides information about the server",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "user",
            description: "Provides information about a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user to gather information",
                    type: ApplicationCommandOptionType.User
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

    await interaction.deferReply({ ephemeral: true });

    if (interaction.options.getSubcommand() === "server") {
        const guild_owner = await interaction.guild.fetchOwner().catch(() => {
            return {
                user: {
                    tag: "undefined"
                }
            };
        });

        const appeal_setting = await FindOrCreateEntity(AppealSetting, { Snowflake: interaction.guild.id });
        const guild_id = await FindOrCreateEntity(GuildID, { Snowflake: interaction.guild.id });
        const moderation_setting = await FindOrCreateEntity(ModerationSetting, { Snowflake: interaction.guild.id });

        const embed_one = new EmbedBuilder()
        .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
        .setFields(
            { name: "General Information", value: `- **Name**\n - ${interaction.guild.name}\n - ${interaction.guild.id}\n- **Description**\n> ${!interaction.guild.description ? "No server description" : interaction.guild.description}\n- **Owner**\n - ${guild_owner.user.tag}\n - ${interaction.guild.ownerId}\n- **Creation** • <t:${Math.trunc(Math.floor(interaction.guild.createdTimestamp / 1000))}:D>` },
            { name: "Miscellaneous Information", value: `- **Channel [${await GuildChannelCount(interaction.guild, [ ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildMedia, ChannelType.GuildStageVoice, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread ])}]**\n - **Text** • ${await GuildChannelCount(interaction.guild, [ ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildText ])}\n - **Thread** • ${await GuildChannelCount(interaction.guild, [ ChannelType.AnnouncementThread, ChannelType.PrivateThread, ChannelType.PublicThread ])}\n - **Voice** • ${await GuildChannelCount(interaction.guild, [ ChannelType.GuildStageVoice, ChannelType.GuildVoice ])}\n- **Member** • ${interaction.guild.memberCount.toLocaleString()}\n- **Roles** • ${interaction.guild.roles.cache.size}` },
            { name: `${client.user.username} Information`, value: `${appeal_setting.AppealLinkStatus && appeal_setting.AppealLink ? `- **Appeal** • [View Link](${appeal_setting.AppealLink} 'Appeal Link')\n` : ""}- **Default Timeout Timer** • ${FormatTime(moderation_setting.TimeoutTimer, ", ")}\n- **Case Created** • ${guild_id.InfractionCreation.toLocaleString()} Cases\n- **Moderation Reason Required?** • ${moderation_setting.RequireReason ? "Yes" : "No"}` }
        )
        .setImage(interaction.guild.bannerURL({ forceStatic: false, size: 4096 }))
        .setColor(Blossom.DefaultHex());

        return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "user") {
        const user = interaction.options.getUser("user", false) ?? interaction.user;

        let user_badges = user.flags?.toArray().map((flag) => DiscordBadges[flag as keyof typeof DiscordBadges]).filter((x) => x !== undefined);
        if (!user_badges || user_badges.length === 0) user_badges = [ DiscordBadges.None ];
        if (!user.bannerURL()) await user.fetch(true);

        const member = await interaction.guild.members.fetch(user.id).catch(() => { return undefined });
        const member_id = await FindOrCreateEntity(MemberID, { Snowflake: `${user.id}_${interaction.guild.id}` })

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setImage(user.bannerURL({ forceStatic: false, size: 4096 }) ?? null)
        .setColor(Blossom.DefaultHex());

        if (!member) embed_one.setFields(
            { name: "General Information", value: `- **Name**\n - ${user.tag}\n - ${user.id}\n- **Creation** • <t:${Math.trunc(Math.floor(user.createdTimestamp / 1000))}:D>\n- **Badges** • ${user_badges.join(" ")}` },
            { name: `${client.user.username} Information`, value: `- **Warnings** • ${member_id.WarnInfraction}\n- **Banned?** • ${await MemberBannedStatus(interaction.guild, user.id) ? "Banned" : "Not Banned"}` }
        );
        else {
            const member_roles = member.roles.cache.map((role) => role.id === interaction.guild.id ? "@everyone" : `<@&${role.id}>`);
            const total_roles = member.roles.cache.size;
            let display_roles: string[];

            if (total_roles > 10) {
                display_roles = member_roles.slice(0, 10);
                display_roles.push(`\`${total_roles - 10}+\``);
            }
            else display_roles = member_roles;

            const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: interaction.guild.id });
            const roles = member.roles.cache.map((role) => role.id);
            const member_rank = user.id === interaction.guild.ownerId ? "Owner" : !!roles.includes(role_manager.StaffTeamGuildOwner) ? "Owner" : !!roles.includes(role_manager.StaffTeamGuildAppManager) ? "Application Manager" : !!roles.includes(role_manager.StaffTeamGuildManager) ? "Server Manager" : !!roles.includes(role_manager.StaffTeamGuildModerator) ? "Moderator" : "Member";

            embed_one.setFields(
                { name: "General Information", value: `- **Name** [\`${member.displayName}\`]\n - **Username** • ${user.tag}\n - **ID** • ${user.id}\n- **Creation** • <t:${Math.trunc(Math.floor(user.createdTimestamp / 1000))}:D>\n- **Joined** • <t:${Math.trunc(Math.floor(Number(member.joinedTimestamp) / 1000))}:D>\n- **Badges** • ${user_badges.join(" ")}` },
                { name: `${client.user.username} Information`, value: `- **Warnings** • ${member_id.WarnInfraction}\n- **Server Ranked** • ${member_rank}` },
                { name: `Account Roles [${total_roles}]`, value: display_roles.join(" | ") }
            );
        };

        return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
    };
};