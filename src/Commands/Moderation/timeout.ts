import { ChatInputCommandBuilder, CompareRolePosition, MemberHasPermissions, MemberTimeoutStatus } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { setTimeout } from "timers/promises";
import { Blossom, CreateInfraction, FindOrCreateEntity, InfractionMessage, ModerationSetting, Sentry, UpdateGuildID } from "../../Core";
import custom_moderation_reason from "../../Core/JSON/CustomModerationReason.json";
import type { AutocompleteProps, CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "timeout",
    description: "Adds or removes a timeout",
    options: [
        {
            name: "add",
            description: "Timeout a member from the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "The member you want to timeout",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "duration",
                    description: "How long should the member be timed out for",
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        { name: "1 Week", value: 604800 },
                        { name: "1 Day", value: 86400 },
                        { name: "1 Hour", value: 3600 },
                        { name: "10 Minutes", value: 600 },
                        { name: "5 Minutes", value: 300 },
                        { name: "1 Minute", value: 60 }
                    ]
                },
                {
                    name: "reason",
                    description: "The reason for the timeout",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    max_length: 250,
                    min_length: 5
                }
            ]
        },
        {
            name: "remove",
            description: "Removes a timeout from a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "The member you want to remove the timeout from",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "reason",
                    description: "The reason for the timeout removal",
                    type: ApplicationCommandOptionType.String,
                    max_length: 250,
                    min_length: 5
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
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const moderation_setting = await FindOrCreateEntity(ModerationSetting, { Snowflake: interaction.guild.id });
    const member = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason", false);

    await interaction.deferReply({ ephemeral: true });

    if (moderation_setting.RequireReason && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>.`);
    if (!member) return void await Blossom.CreateInteractionError(interaction, `The member you entered is no longer a member of ${interaction.guild.name}.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.ModerateMembers ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Ensure ${client.user.username} has **Timeout Members** permission in ${interaction.guild.name}.`);
    if (await MemberHasPermissions(interaction.guild, member.id, [ PermissionsBitField.Flags.Administrator ])) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on a member who has **Administrator** permission.`);
    if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on yourself.`);
    if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on ${client.user.username}.`);
    if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    if (interaction.options.getSubcommand() === "add") {
        if (await MemberTimeoutStatus(interaction.guild, member.id)) return void await Blossom.CreateInteractionError(interaction, `The member you entered is already timed out in ${interaction.guild.name}.`);

        const duration = interaction.options.getInteger("duration", false) ?? moderation_setting.TimeoutTimer;
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
            TargetID: member.id,
            Type: "TimeoutAdd"
        });

        const infraction_message = new InfractionMessage({
            client: client,
            guild: interaction.guild,
            infraction: infraction,
            type: "TimeoutAdd",
            duration: duration
        });

        await infraction_message.SendDM();
        await setTimeout(300);
        await member.timeout(1000 * duration, reason ? `${infraction.Reason} • ${interaction.user.tag}` : `No reason was provided for the timeout by ${interaction.user.tag}`);
        await infraction_message.ConfirmationMessage(interaction.channel);
        await setTimeout(300);
        await infraction_message.SendWebhook("Private");
        await infraction_message.SendWebhook("Public");

        return void await interaction.followUp({ content: `**${member.user.tag}** was timed out in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "remove") {
        if (!await MemberTimeoutStatus(interaction.guild, member.id)) return void await Blossom.CreateInteractionError(interaction, `The member you entered is not timed out in ${interaction.guild.name}.`);

        const case_id = await UpdateGuildID(interaction.guild.id, "InfractionCreation");
        const creation_timestamp = Date.now();
        const infraction = await CreateInfraction({
            Snowflake: interaction.guild.id,
            CaseID: case_id,
            CreationTimestamp: creation_timestamp,
            EvidenceAttachmentURL: "",
            Reason: reason ?? `No reason was provided for the timeout removal by ${interaction.user.tag}`,
            RemovalReason: "",
            RemovalStaffID: "",
            StaffID: interaction.user.id,
            TargetID: member.id,
            Type: "TimeoutRemove"
        });

        const infraction_message = new InfractionMessage({
            client: client,
            guild: interaction.guild,
            infraction: infraction,
            type: "TimeoutRemove"
        });

        await infraction_message.SendDM();
        await setTimeout(300);
        await member.timeout(null, reason ? `${infraction.Reason} • ${interaction.user.tag}` : `No reason was provided for the timeout removal by ${interaction.user.tag}`);
        await infraction_message.ConfirmationMessage(interaction.channel);
        await setTimeout(300);
        await infraction_message.SendWebhook("Private");
        await infraction_message.SendWebhook("Public");

        return void await interaction.followUp({ content: `**${member.user.tag}**'s timeout was removed in **${interaction.guild.name}**!`, ephemeral: true });
    };
};

export function autocomplete({ client, handler, interaction }: AutocompleteProps): undefined {
    if (!interaction.inCachedGuild() || !interaction.isAutocomplete()) return;

    if (interaction.options.getSubcommand() === "add") {
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
};