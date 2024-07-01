import { MemberBannedStatus } from "@cosmosportal/blossom.utils";
import { EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, DiscordBadges, FindOneEntity, FindOrCreateEntity, MemberID, ReportSystem, RoleManager, Sentry } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewReportSystemUserInfo") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const report_system = await FindOneEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id });
    if (!report_system) return void await Blossom.CreateInteractionError(interaction, `I couldn't find the report information. This could be due to the report no longer existing in ${client.user.username}'s database.`);

    await interaction.deferReply({ ephemeral: true });

    const user = await client.users.fetch(report_system.TargetID).catch(() => { return undefined });
    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

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
            { name: "General Information", value: `- **Name** [\`${member.displayName}\`]\n - **Username** • ${user.tag}\n - **ID** • ${user.id}\n- **Creation** • <t:${Math.trunc(Math.floor(user.createdTimestamp / 1000))}:D>\n- **Joined** • <t:${Math.trunc(Math.floor(member.joinedTimestamp ?? 0 / 1000))}:D>\n- **Badges** • ${user_badges.join(" ")}` },
            { name: `${client.user.username} Information`, value: `- **Warnings** • ${member_id.WarnInfraction}\n- **Server Ranked** • ${member_rank}` },
            { name: `Account Roles [${total_roles}]`, value: display_roles.join(" | ") }
        );
    };

    return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
};