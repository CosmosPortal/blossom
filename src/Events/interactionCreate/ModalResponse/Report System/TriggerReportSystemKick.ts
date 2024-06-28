import { ButtonBuilder, CompareRolePosition, MemberHasPermissions } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, PermissionsBitField, type Client, type ModalSubmitInteraction } from "discord.js";
import { setTimeout } from "timers/promises";
import { ActionTypeName, Blossom, CreateActionID, CreateInfraction, FindOneEntity, FindOrCreateEntity, InfractionMessage, ModerationSetting, ReportSystem, Sentry, UpdateEntity, UpdateGuildID, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: ModalSubmitInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isModalSubmit() || interaction.customId !== "TriggerReportSystemKick") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const moderation_setting = await FindOrCreateEntity(ModerationSetting, { Snowflake: interaction.guild.id });
    const reason = interaction.fields.getTextInputValue("reason") as string | null;

    if (!interaction.message) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the message. The message either no longer exist or ${client.user.username} couldn't fetch the message.`)

    const report_system = await FindOneEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id });
    if (!report_system) return void await Blossom.CreateInteractionError(interaction, `I couldn't find the report information. This could be due to the report no longer existing in ${client.user.username}'s database.`);

    const user = await client.users.fetch(report_system.TargetID).catch(() => { return undefined });
    if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

    const member = await interaction.guild.members.fetch(user.id).catch(() => { return undefined });

    if (!report_system.Active) return void await Blossom.CreateInteractionError(interaction, "This report has been marked as inactive.");
    if (report_system.HasKickLogged) return void await Blossom.CreateInteractionError(interaction, "This action has already been executed in this report.");
    if (moderation_setting.RequireReason && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for this feature.`);
    if (!member) return void await Blossom.CreateInteractionError(interaction, `The reported member is no longer a member of ${interaction.guild.name}.`);
    if (!member.kickable) return void await Blossom.CreateInteractionError(interaction, `The reported member is not kickable in ${interaction.guild.name}.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.KickMembers ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run this feature. Ensure ${client.user.username} has **Kick Members** permission in ${interaction.guild.name}.`);
    if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on yourself.`);
    if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on ${client.user.username}.`);
    if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    await interaction.deferUpdate();

    const case_id = await UpdateGuildID(interaction.guild.id, "InfractionCreation");
    const creation_timestamp = Date.now();
    const action_id = CreateActionID(creation_timestamp);
    const infraction = await CreateInfraction({
        Snowflake: interaction.guild.id,
        ActionID: action_id,
        Active: true,
        CaseID: case_id,
        CreationTimestamp: `${creation_timestamp}`,
        EvidenceAttachmentURL: "",
        Reason: reason ?? `No reason was provided for the kick by ${interaction.user.tag}`,
        RemovalReason: "",
        RemovalStaffID: "",
        RemovalStaffUsername: "",
        StaffID: interaction.user.id,
        StaffUsername: interaction.user.tag,
        TargetID: user.id,
        TargetUsername: user.tag,
        Type: "Kick"
    });

    const infraction_message = new InfractionMessage({
        client: client,
        guild: interaction.guild,
        infraction: infraction,
        type: "Kick"
    });

    await infraction_message.SendDM();
    await setTimeout(300);
    await member.kick(reason ? `${infraction.Reason} • ${interaction.user.tag}` : `No reason was provided for the kick by ${interaction.user.tag}`);
    await UpdateEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id }, { HasKickLogged: true });
    await setTimeout(300);
    await infraction_message.SendWebhook("Private");
    await infraction_message.SendWebhook("Public");

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.message.embeds[0].thumbnail?.url ?? null)
    .setAuthor({ name: `Case #${report_system.CaseID} | ${ActionTypeName[report_system.Type as ReportType]}` })
    .setDescription(interaction.message.embeds[0].description)
    .addFields(
        { name: "Reason", value: interaction.message.embeds[0].fields[0].value },
        { name: "Action Log", value: interaction.message.embeds[0].fields[1].value === "None" ? `- <@${interaction.user.id}> issued a **kick** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` : `${interaction.message.embeds[0].fields[1].value}\n- <@${interaction.user.id}> issued a **kick** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` }
    )
    .setImage(interaction.message.embeds[0].image?.url ?? null)
    .setFooter({ text: `Report ID • ${report_system.ActionID} | Reported by ${report_system.ReporterUsername}` })
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitReportSystem",
        style: ButtonStyle.Danger,
        label: "Dismiss Report"
    });

    if (report_system.Type === "MessageReport") action_row_one.CreateRegularButton({
        custom_id: "TriggerReportSystemDeleteMessage",
        style: ButtonStyle.Danger,
        disabled: report_system.IsMessageDeleted,
        label: "Delete Message"
    });

    action_row_one.CreateRegularButton({
        custom_id: "ViewReportSystemUserInfo",
        style: ButtonStyle.Secondary,
        label: "User Info"
    });

    const action_row_two = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewReportSystemBanAdd",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasBanAddLogged,
        label: "Ban"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemKick",
        style: ButtonStyle.Secondary,
        disabled: true,
        label: "Kick"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemTimeout",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasTimeoutAddLogged,
        label: "Timeout"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemWarnAdd",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasWarnAddLogged,
        label: "Warn"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemWarnVerbal",
        style: ButtonStyle.Secondary,
        disabled: report_system.HasWarnVerbalLogged,
        label: "Verbal Warn"
    }).BuildActionRow();

    await interaction.editReply({ content: interaction.message.content, embeds: [embed_one], components: [action_row_one.BuildActionRow(), action_row_two], allowedMentions: { parse: [ "roles" ] } });
    await setTimeout(300);
    return void await interaction.followUp({ content: `**${member.user.tag}** was kicked from **${interaction.guild.name}**!`, ephemeral: true });
};