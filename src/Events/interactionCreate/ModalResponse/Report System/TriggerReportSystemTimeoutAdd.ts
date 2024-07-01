import { ButtonBuilder, CompareRolePosition, MemberHasPermissions } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, PermissionsBitField, type Client, type ModalSubmitInteraction } from "discord.js";
import { setTimeout } from "timers/promises";
import { ActionName, Blossom, CreateInfraction, FindOneEntity, FindOrCreateEntity, InfractionMessage, ModerationSetting, ReportSystem, Sentry, UpdateEntity, UpdateGuildID, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: ModalSubmitInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isModalSubmit() || interaction.customId !== "TriggerReportSystemTimeoutAdd") return;
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
    if (report_system.HasTimeoutAddLogged) return void await Blossom.CreateInteractionError(interaction, "This action has already been executed in this report.");
    if (moderation_setting.RequireReason && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for this feature.`);
    if (!member) return void await Blossom.CreateInteractionError(interaction, `The reported member is no longer a member of ${interaction.guild.name}.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.ModerateMembers ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run this feature. Ensure ${client.user.username} has **Timeout Members** permission in ${interaction.guild.name}.`);
    if (await MemberHasPermissions(interaction.guild, member.id, [ PermissionsBitField.Flags.Administrator ])) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on a member who has **Administrator** permission.`);
    if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on yourself.`);
    if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on ${client.user.username}.`);
    if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run this feature on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The reported member has a higher role than ${client.user.username}.`);

    await interaction.deferUpdate();

    const duration = moderation_setting.TimeoutTimer;
    const case_id = await UpdateGuildID(interaction.guild.id, "InfractionCreation");
    const creation_timestamp = Date.now();
    const infraction = await CreateInfraction({
        Snowflake: interaction.guild.id,
        CaseID: case_id,
        CreationTimestamp: creation_timestamp,
        EvidenceAttachmentURL: "",
        Reason: reason ?? `No reason was provided for the timeout by ${interaction.user.tag}`,
        RemovalReason: "",
        RemovalStaffID: "",
        StaffID: interaction.user.id,
        TargetID: user.id,
        Type: "TimeoutAdd"
    });

    const infraction_message = new InfractionMessage({
        client: client,
        guild: interaction.guild,
        infraction: infraction,
        type: "TimeoutAdd"
    });

    await infraction_message.SendDM();
    await setTimeout(300);
    await member.timeout(1000 * duration, reason ? `${infraction.Reason} • ${interaction.user.tag}` : `No reason was provided for the timeout by ${interaction.user.tag}`);
    await UpdateEntity(ReportSystem, { Guild_ID: interaction.guild.id, ReportMessageID: interaction.message.id }, { HasTimeoutAddLogged: true });
    await setTimeout(300);
    await infraction_message.SendWebhook("Private");
    await infraction_message.SendWebhook("Public");

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.message.embeds[0].thumbnail?.url ?? null)
    .setAuthor({ name: `Case #${report_system.CaseID} | ${ActionName[report_system.Type as ReportType]}` })
    .setDescription(interaction.message.embeds[0].description)
    .addFields(
        { name: "Reason", value: interaction.message.embeds[0].fields[0].value },
        { name: "Action Log", value: interaction.message.embeds[0].fields[1].value === "None" ? `- <@${interaction.user.id}> issued a **timeout** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` : `${interaction.message.embeds[0].fields[1].value}\n- <@${interaction.user.id}> issued a **timeout** | <t:${Math.trunc(Math.floor(creation_timestamp / 1000))}:R>` }
    )
    .setImage(interaction.message.embeds[0].image?.url ?? null)
    .setFooter({ text: interaction.message.embeds[0].footer?.text ?? "An issue occured" })
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
        disabled: report_system.HasKickLogged,
        label: "Kick"
    })
    .CreateRegularButton({
        custom_id: "ViewReportSystemTimeout",
        style: ButtonStyle.Secondary,
        disabled: true,
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
    return void await interaction.followUp({ content: `**${member.user.tag}** was timed out in **${interaction.guild.name}**!`, ephemeral: true });
};