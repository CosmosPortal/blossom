import { ChatInputCommandBuilder, CompareRolePosition } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { ActionType, Blossom, Color, CreateInfraction, FindMemberInfraction, FindOneEntity, FindOrCreateEntity, GuildModerationSetting, InfractionMessage, InfractionSystem, Sentry, UpdateEntity, UpdateGuildID, UpdateMemberID, type InfractionType } from "../../Core";
import custom_moderation_reason from "../../Core/JSON/CustomModerationReason.json";
import type { AutocompleteProps, CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "warn",
    description: "Adds, removes, view a warning",
    options: [
        {
            name: "add",
            description: "Warn a member in the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "The member you want to warn",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "reason",
                    description: "The reason for the warn",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    max_length: 250,
                    min_length: 5
                }
            ]
        },
        {
            name: "remove",
            description: "Removes a warning from a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "The member you want to remove the warning from",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "action_id",
                    description: "The warning action ID to remove",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "reason",
                    description: "The reason for the warning removal",
                    type: ApplicationCommandOptionType.String,
                    max_length: 250,
                    min_length: 5
                }
            ]
        },
        {
            name: "view",
            description: "Views information about a warning",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "action_id",
                    description: "The warning action ID to view",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "is_inactive",
                    description: "If true, checks for inactive warnings as well",
                    type: ApplicationCommandOptionType.Boolean
                },
                {
                    name: "user",
                    description: "The user the warning belongs to",
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
    if (!await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });

    await interaction.deferReply({ ephemeral: true });

    if (interaction.options.getSubcommand() === "add") {
        const member = interaction.options.getMember("member");
        const reason = interaction.options.getString("reason", false);

        if (guild_moderation_setting.RequireReason === true && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>.`);
        if (!member) return void await Blossom.CreateInteractionError(interaction, `The member you entered is no longer a member of ${interaction.guild.name}.`);
        if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on yourself.`);
        if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on ${client.user.username}.`);
        if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
        if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on a member with a higher role than you.`);
        if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

        const case_id = await UpdateGuildID(interaction.guild.id, "InfractionCreation");
        await UpdateMemberID(`${member.id}_${interaction.guild.id}`, "WarnInfraction", true);
        const creation_timestamp = Date.now();
        const action_id = `${creation_timestamp}${new Date(creation_timestamp).getFullYear()}${new Date(creation_timestamp).getDate()}${new Date(creation_timestamp).getMonth() + 1}`;
        const infraction = await CreateInfraction({
            Snowflake: interaction.guild.id,
            ActionID: action_id,
            Active: true,
            CaseID: case_id,
            CreationTimestamp: `${creation_timestamp}`,
            EvidenceAttachmentURL: "",
            Reason: reason ?? `No reason was provided for the warning by ${interaction.user.tag}`,
            RemovalReason: "",
            RemovalStaffID: "",
            RemovalStaffUsername: "",
            StaffID: interaction.user.id,
            StaffUsername: interaction.user.tag,
            TargetID: member.id,
            TargetUsername: member.user.tag,
            Type: "WarnAdd"
        });

        const infraction_message = new InfractionMessage({
            client: client,
            guild: interaction.guild,
            infraction: infraction,
            type: "WarnAdd"
        });

        await infraction_message.SendDM();
        await infraction_message.ConfirmationMessage(interaction.channel);
        await infraction_message.SendWebhook("Private");
        await infraction_message.SendWebhook("Public");

        return void await interaction.followUp({ content: `**${member.user.tag}** was warned in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "remove") {
        const member = interaction.options.getMember("member");
        const reason = interaction.options.getString("reason", false);

        if (!member) return void await Blossom.CreateInteractionError(interaction, `The member you entered is no longer a member of ${interaction.guild.name}.`);
        if (guild_moderation_setting.RequireReason === true && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>.`);
        if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on yourself.`);
        if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on ${client.user.username}.`);
        if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
        if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on a member with a higher role than you.`);
        if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

        const warning = await FindOneEntity(InfractionSystem, { TargetID: member.id, ActionID: interaction.options.getString("action_id", true) });
        if (!warning) return void await Blossom.CreateInteractionError(interaction, "The warning action ID you entered doesn't exist for this member.");
        if (!warning.Active) return void await Blossom.CreateInteractionError(interaction, "The warning action ID you entered is marked as inactive.");

        await UpdateMemberID(`${member.id}_${interaction.guild.id}`, "WarnInfraction", true);
        await UpdateEntity(InfractionSystem, { TargetID: member.id, ActionID: interaction.options.getString("action_id", true) }, {
            Active: false,
            RemovalReason: reason ?? `No reason was provided for the warning removal by ${interaction.user.tag}`,
            RemovalStaffID: interaction.user.id,
            RemovalStaffUsername: interaction.user.tag
        });
        const infraction = await FindOneEntity(InfractionSystem, { TargetID: member.id, ActionID: interaction.options.getString("action_id", true) }) as InfractionSystem;

        const infraction_message = new InfractionMessage({
            client: client,
            guild: interaction.guild,
            infraction: infraction,
            type: "WarnRemove"
        });

        await infraction_message.SendDM();
        await infraction_message.ConfirmationMessage(interaction.channel);
        await infraction_message.SendWebhook("Private");
        await infraction_message.SendWebhook("Public");

        return void await interaction.followUp({ content: `**${member.user.tag}**'s warning has been removed in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "view") {
        const user = interaction.options.getUser("user", false) ?? interaction.user;
        const warning = await FindMemberInfraction(interaction.guild.id, user.id, interaction.options.getString("action_id", true), interaction.options.getBoolean("is_inactive", false) ?? false);
        if (!warning) return void await Blossom.CreateInteractionError(interaction, "The warning action ID you entered doesn't exist. If you are trying to view an inactive warning, make sure `is_inactive` option is toggle to `true`. If this warning belongs to another user, make sure to mention/enter user ID in the `user` option.")
        const fields = [
            { name: "Moderation Information", value: `- **Action ID** • ${warning.ActionID}\n- **Creation** • <t:${Math.trunc(Math.floor(Number(warning.CreationTimestamp) / 1000))}:D>\n- **Status** • ${warning.Active == true ? "Active" : "Inactive"}\n- **Staff Member** • ${warning.StaffUsername} [\`${warning.StaffID}\`]\n- **Target Member** • ${warning.TargetUsername} [\`${warning.TargetID}\`]` },
            { name: "Reason", value: warning.Reason }
        ];

        if (warning.RemovalReason && warning.RemovalStaffID && warning.RemovalStaffUsername) fields.push(
            { name: "Removal Information", value: `- **Staff Member** • ${warning.RemovalStaffUsername} [\`${warning.RemovalStaffID}\`]` },
            { name: "Removal Reason", value: warning.RemovalReason }
        );

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${warning.CaseID} | ${ActionType[warning.Type as InfractionType]}` })
        .setFields(fields)
        .setColor(Color[warning.Type as InfractionType]);

        return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
    };
};

export function autocomplete({ client, handler, interaction }: AutocompleteProps): undefined {
    if (interaction.options.getSubcommand() === "remove" || interaction.options.getSubcommand() === "view") return;
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