import { ButtonBuilder, ChatInputCommandBuilder, CompareRolePosition, HasChannelPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, type TextChannel } from "discord.js";
import { ActionTypeName, Blossom, CreateActionID, CreateReport, FindOrCreateEntity, ReportSetting, ReportSystem, ReportType, RoleManager, Sentry, UpdateEntity, UpdateGuildID } from "../../Core";
import custom_moderation_reason from "../../Core/JSON/CustomModerationReason.json";
import type { AutocompleteProps, CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "report",
    description: "Submits a report to the server's staff team",
    options: [
        {
            name: "user",
            description: "The user you want to report",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            description: "The reason you are creating the report",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            max_length: 250,
            min_length: 5,
            required: true
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

    const report_setting = await FindOrCreateEntity(ReportSetting, { Snowflake: interaction.guild.id });
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const report_channel = await interaction.guild.channels.fetch(report_setting.UserReportChannel).catch(() => { return undefined }) as TextChannel | undefined;

    if (!report_setting.UserReportStatus) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} has the user report system disabled.`);
    if (!report_channel) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} does not have a user report channel set.`);
    if (!await HasChannelPermissions(client, report_channel.id, client.user.id, [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName}:${interaction.commandId}>. Ensure ${client.user.username} has **View Channel**, **Send Messages**, and **Embed Links** permission in the user report channel.`);
    if (report_setting.UserReportThreadMode && !await HasChannelPermissions(client, report_channel.id, client.user.id, [ PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.CreatePublicThreads ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName}:${interaction.commandId}>. Ensure ${client.user.username} has **Send Messages in Threads** and **Create Public Threads** permission in the user report channel.`);
    if (await Blossom.IsGuildStaffMember(interaction.guild, user)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on a staff member of ${interaction.guild.name}.`);
    if (user.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on yourself.`);
    if (user.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on ${client.user.username}.`);
    if (user.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on a member with a higher role than you.`);
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
        FlaggedChannelID: "",
        FlaggedMessageID: "",
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
        Type: "UserReport"
    });

    const embed_one = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
    .setAuthor({ name: `Case #${report.CaseID} | ${ActionTypeName[report.Type as ReportType]}` })
    .setDescription(`<@${user.id}> has been reported by <@${interaction.user.id}>.\n- **Reported User** • ${user.tag} [\`${user.id}\`]\n- **Report Creation** • <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:D>`)
    .addFields(
        { name: "Reason", value: reason },
        { name: "Action Log", value: `None` }
    )
    .setFooter({ text: `Report ID • ${action_id} | Reported by ${interaction.user.tag}` })
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitReportSystem",
        style: ButtonStyle.Danger,
        label: "Dismiss Report"
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

    if (report_setting.UserReportThreadMode) {
        const report_thread = await report_channel.threads.create({
            name: `Case #${report.CaseID} | ${ActionTypeName[report.Type as ReportType]}`,
            reason: `Creating ${ActionTypeName[report.Type as ReportType]} Case #${report.CaseID}`,
            type: ChannelType.PrivateThread
        });

        const report_message = await report_thread.send({ content: !report_setting.UserReportNotifiedStaffTeam || guild_owner.length === 0 ? "" : staff_team_roles.join(" | "), embeds: [embed_one], components: [action_row_one, action_row_two], allowedMentions: { parse: [ "roles" ] } });

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
        const report_message = await report_channel.send({ content: !report_setting.UserReportNotifiedStaffTeam || guild_owner.length === 0 ? "" : staff_team_roles.join(" | "), embeds: [embed_one], components: [action_row_one, action_row_two], allowedMentions: { parse: [ "roles" ] } });

        await UpdateEntity(ReportSystem, {
            ActionID: action_id,
            Guild_ID: interaction.guild.id,
            TargetID: user.id
        }, {
            ReportChannelID: report_channel.id,
            ReportMessageID: report_message.id
        });
    };

    return void await interaction.followUp({ content: `<@${user.id}> has been flagged and sent to the ${interaction.guild.name}'s staff team for a review!`, ephemeral: true });
};

export function autocomplete({ client, handler, interaction }: AutocompleteProps): undefined {
    if (!interaction.inCachedGuild() || !interaction.isAutocomplete()) return;

    const focused = interaction.options.getFocused();
    const filter_choices = custom_moderation_reason.filter((custom_reason) => custom_reason.reason.toLowerCase().startsWith(focused.toLowerCase()));
    const result = filter_choices.map((choice) => {
        return {
            name: `${choice.id} | ${choice.reason}`,
            value: choice.reason
        };
    });

    return void interaction.respond(result.slice(0, 25)).catch(() => {});
};