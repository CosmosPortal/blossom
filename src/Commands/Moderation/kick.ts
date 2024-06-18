import { ChatInputCommandBuilder, CompareRolePosition, MemberHasPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { setTimeout } from "timers/promises";
import { Blossom, CreateInfraction, FindOrCreateEntity, GuildModerationSetting, InfractionMessage, Sentry, UpdateGuildID } from "../../Core";
import custom_moderation_reason from "../../Core/JSON/CustomModerationReason.json";
import type { AutocompleteProps, CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "kick",
    description: "Kicks a member from the server",
    options: [
        {
            name: "member",
            description: "The member you want to kick",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "reason",
            description: "The reason for the kick",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
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
    if (!await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });
    const member = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason", false);

    await interaction.deferReply({ ephemeral: true });

    if (guild_moderation_setting.RequireReason === true && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName}:${interaction.commandId}>.`);
    if (!member) return void await Blossom.CreateInteractionError(interaction, `The member you entered is no longer a member of ${interaction.guild.name}.`);
    if (!member.kickable) return void await Blossom.CreateInteractionError(interaction, `The member you entered is not kickable in ${interaction.guild.name}.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.KickMembers ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName}:${interaction.commandId}>. Ensure ${client.user.username} has **Kick Members** permission in ${interaction.guild.name}.`);
    if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on yourself.`);
    if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on ${client.user.username}.`);
    if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    const case_id = await UpdateGuildID(interaction.guild.id, "InfractionCreation");
    const creation_timestamp = Date.now();
    const action_id = `${creation_timestamp}${new Date(creation_timestamp).getFullYear()}${new Date(creation_timestamp).getDate()}${new Date(creation_timestamp).getMonth() + 1}`;
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
        TargetID: member.id,
        TargetUsername: member.user.tag,
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
    await infraction_message.ConfirmationMessage(interaction.channel);
    await setTimeout(300);
    await infraction_message.SendWebhook("Private");
    await infraction_message.SendWebhook("Public");

    return void await interaction.followUp({ content: `**${member.user.tag}** was kicked from **${interaction.guild.name}**!`, ephemeral: true });
};

export function autocomplete({ client, handler, interaction }: AutocompleteProps): undefined {
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