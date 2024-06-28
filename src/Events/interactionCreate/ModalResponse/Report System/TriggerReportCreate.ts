import { ButtonBuilder, CompareRolePosition, CropText, HasChannelPermissions } from "@cosmosportal/blossom.utils";
import { ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, type Client, type GuildTextBasedChannel, type ModalSubmitInteraction, type TextChannel } from "discord.js";
import { ActionTypeName, Blossom, CompareDate, CreateActionID, CreateReport, FindOrCreateEntity, ReportSetting, ReportSystem, RoleManager, Sentry, UpdateEntity, UpdateGuildID, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: ModalSubmitInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isModalSubmit() || !interaction.customId.startsWith("TriggerReportSystemCreate")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);

    await interaction.deferReply({ ephemeral: true });

    const custom_id = interaction.customId.split("_");
    const report_setting = await FindOrCreateEntity(ReportSetting, { Snowflake: interaction.guild.id });
    const reason = interaction.fields.getTextInputValue("reason");
    const report_channel = await interaction.guild.channels.fetch(report_setting.MessageReportChannel).catch(() => { return undefined }) as TextChannel | undefined;

    const user = await client.users.fetch(custom_id[2]).catch(() => { return undefined });
    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

    const channel = await interaction.guild.channels.fetch(custom_id[3]).catch(() => { return undefined }) as GuildTextBasedChannel | undefined;
    if (!channel) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the channel. The channel either no longer exist or ${client.user.username} couldn't fetch the channel.`);

    const message = await channel.messages.fetch(custom_id[4]).catch(() => { return undefined });
    if (!message) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the message. The message either no longer exist or ${client.user.username} couldn't fetch the message.`);

    if (CompareDate(message.createdTimestamp, Date.now()) > 5) return void await Blossom.CreateInteractionError(interaction, "You cannot report a message older than 5 days.");
    if (!report_setting.MessageReportStatus) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} has the user report system disabled.`);
    if (!report_channel) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} does not have a user report channel set.`);
    if (!await HasChannelPermissions(client, report_channel.id, client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run **Report Message**. Ensure ${client.user.username} has **View Channel**, **Send Messages**, and **Embed Links** permission in the user report channel.`);
    if (report_setting.MessageReportThreadMode && !await HasChannelPermissions(client, report_channel.id, client.user.id, [ PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run **Report Message**. Ensure ${client.user.username} has **Send Messages in Threads** and **Create Public Threads** permission in the user report channel.`);
    if (await Blossom.IsGuildStaffMember(interaction.guild, user)) return void await Blossom.CreateInteractionError(interaction, `You cannot run **Report Message** on a staff member of ${interaction.guild.name}.`);
    if (user.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run **Report Message** on yourself.`);
    if (user.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run **Report Message** on ${client.user.username}.`);
    if (user.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run **Report Message** on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run **Report Message** on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    const case_id = await UpdateGuildID(interaction.guild.id, "ReportCreation");
    const creation_timestamp = Date.now();
    const action_id = CreateActionID(creation_timestamp);
    const report = await CreateReport({
        Snowflake: interaction.guild.id,
        ActionID: action_id,
        Active: true,
        CaseID: case_id,
        CreationTimestamp: String(creation_timestamp),
        EvidenceAttachmentURL: "",
        FlaggedChannelID: channel.id,
        FlaggedMessageID: message.id,
        HasBanAddLogged: false,
        HasKickLogged: false,
        HasTimeoutAddLogged: false,
        HasWarnAddLogged: false,
        HasWarnVerbalLogged: false,
        IsMessageDeleted: false,
        Reason: reason,
        ReportChannelID: "",
        ReporterID: interaction.user.id,
        ReporterUsername: interaction.user.tag,
        ReportMessageID: "",
        TargetID: user.id,
        TargetUsername: user.tag,
        Type: "MessageReport"
    });

    const attachment = message.attachments.size !== 0 ? message.attachments.at(0)?.url ?? null : null;

    const embed_one = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
    .setAuthor({ name: `Case #${report.CaseID} | ${ActionTypeName[report.Type as ReportType]}` })
    .setDescription(`<@${user.id}>'s [message](${message.url} 'View Message') has been reported by <@${interaction.user.id}>.\n- **Reported User** • ${user.tag} [\`${user.id}\`]\n- **Reported Message**\n${message.content ? `||${CropText(message.content, 297, true)}||` : "There was no message content."}${attachment ? "\n- The message has a file!" : ""}\n- **Report Creation** • <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:D>`)
    .addFields(
        { name: "Reason", value: reason },
        { name: "Action Log", value: `None` }
    )
    .setImage(attachment)
    .setFooter({ text: `Report ID • ${action_id} | Reported by ${interaction.user.tag}` })
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitReportSystem",
        style: ButtonStyle.Danger,
        label: "Dismiss Report"
    })
    .CreateRegularButton({
        custom_id: "TriggerReportSystemDeleteMessage",
        style: ButtonStyle.Danger,
        label: "Delete Message"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemUserInfo",
        style: ButtonStyle.Secondary,
        label: "User Info"
    }).BuildActionRow();

    const action_row_two = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewReportSystemBanAdd",
        style: ButtonStyle.Secondary,
        label: "Ban"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemKick",
        style: ButtonStyle.Secondary,
        label: "Kick"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemTimeout",
        style: ButtonStyle.Secondary,
        label: "Timeout"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemWarnAdd",
        style: ButtonStyle.Secondary,
        label: "Warn"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemWarnVerbal",
        style: ButtonStyle.Secondary,
        label: "Verbal Warn"
    }).BuildActionRow();

    const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: interaction.guild.id });
    const guild_roles = interaction.guild.roles.cache.map((role) => role.id);
    const guild_owner = role_manager.StaffTeamGuildOwner.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_manager = role_manager.StaffTeamGuildManager.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_moderator = role_manager.StaffTeamGuildModerator.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const staff_team_roles = guild_owner.concat(guild_manager, guild_moderator);

    if (report_setting.MessageReportThreadMode) {
        const report_thread = await report_channel.threads.create({
            name: `Case #${report.CaseID} | ${ActionTypeName[report.Type as ReportType]}`,
            reason: `Creating ${ActionTypeName[report.Type as ReportType]} Case #${report.CaseID}`,
            type: ChannelType.PrivateThread
        });

        const report_message = await report_thread.send({ content: !report_setting.MessageReportNotifiedStaffTeam || guild_owner.length === 0 ? "" : staff_team_roles.join(" | "), embeds: [embed_one], components: [action_row_one, action_row_two], allowedMentions: { parse: [ "roles" ] } });

        await UpdateEntity(ReportSystem, {
            ActionID: action_id,
            Guild_ID: interaction.guild.id,
            TargetID: user.id
        }, {
            ReportChannelID: report_thread.id,
            ReportMessageID: report_message.id
        });
    }
    else {
        const report_message = await report_channel.send({ content: !report_setting.MessageReportNotifiedStaffTeam || guild_owner.length === 0 ? "" : staff_team_roles.join(" | "), embeds: [embed_one], components: [action_row_one, action_row_two], allowedMentions: { parse: [ "roles" ] } });

        await UpdateEntity(ReportSystem, {
            ActionID: action_id,
            Guild_ID: interaction.guild.id,
            TargetID: user.id
        }, {
            ReportChannelID: report_channel.id,
            ReportMessageID: report_message.id
        });
    };

    return void await interaction.followUp({ content: `This message has been flagged and sent to the ${interaction.guild.name}'s staff team for a review!`, ephemeral: true });
};