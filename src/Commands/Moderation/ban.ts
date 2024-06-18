import { ChatInputCommandBuilder, CompareRolePosition, MemberBannedStatus, MemberHasPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { setTimeout } from "timers/promises";
import { Blossom, CreateInfraction, FindOrCreateEntity, GuildModerationSetting, InfractionMessage, Sentry, UpdateGuildID } from "../../Core";
import custom_moderation_reason from "../../Core/JSON/CustomModerationReason.json";
import type { AutocompleteProps, CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "ban",
    description: "Adds or removes a ban",
    options: [
        {
            name: "add",
            description: "Ban a user from the server",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user you want to ban",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "delete_messages",
                    description: "Deletes message history from the selected amount of days",
                    type: ApplicationCommandOptionType.Integer,
                    choices: [
                        { name: "7 Days", value: 7 },
                        { name: "6 Days", value: 6 },
                        { name: "5 Days", value: 5 },
                        { name: "4 Days", value: 4 },
                        { name: "3 Days", value: 3 },
                        { name: "2 Days", value: 2 },
                        { name: "1 Day", value: 1 },
                        { name: "None", value: 0 }
                    ]
                },
                {
                    name: "reason",
                    description: "The reason for the ban",
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    max_length: 250,
                    min_length: 5
                },
                {
                    name: "soft_ban",
                    description: "Bans the user deleting the past 48-hours messages sent and unbanning them afterward",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        },
        {
            name: "remove",
            description: "Removes a ban from a user",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "user",
                    description: "The user you want to remove the ban from",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "reason",
                    description: "The reason for the ban removal",
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
    if (!await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", false);

    await interaction.deferReply({ ephemeral: true });

    if (guild_moderation_setting.RequireReason === true && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.BanMembers ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Ensure ${client.user.username} has **Ban Members** permission in ${interaction.guild.name}.`);
    if (user.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on yourself.`);
    if (user.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on ${client.user.username}.`);
    if (user.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, user.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    if (interaction.options.getSubcommand() === "add") {
        if (await MemberBannedStatus(interaction.guild, user.id)) return void await Blossom.CreateInteractionError(interaction, `The user you entered is already banned in ${interaction.guild.name}.`);

        const delete_messages = interaction.options.getInteger("delete_messages", false) ?? guild_moderation_setting.BanDeleteMessagesHistory;
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
            Reason: reason ?? `No reason was provided for the ${interaction.options.getBoolean("soft_ban", false) ? "soft " : ""}ban by ${interaction.user.tag}`,
            RemovalReason: "",
            RemovalStaffID: "",
            RemovalStaffUsername: "",
            StaffID: interaction.user.id,
            StaffUsername: interaction.user.tag,
            TargetID: user.id,
            TargetUsername: user.tag,
            Type: interaction.options.getBoolean("soft_ban", false) ? "BanSoft" : "BanAdd"
        });

        const infraction_message = new InfractionMessage({
            client: client,
            guild: interaction.guild,
            infraction: infraction,
            type: interaction.options.getBoolean("soft_ban", false) ? "BanSoft" : "BanAdd"
        });

        await infraction_message.SendDM();
        await setTimeout(300);
        if (interaction.options.getBoolean("soft_ban", false)) {
            await interaction.guild.members.ban(user.id, { deleteMessageSeconds: 60 * 60 * 24 * 2, reason: reason ? `${reason} • ${interaction.user.tag}` : `No reason was provided for the ${interaction.options.getBoolean("soft_ban", false) ? "soft " : ""}ban by ${interaction.user.tag}` });
            await setTimeout(300);
            await interaction.guild.members.unban(user.id, reason ? `${infraction.Reason} • ${interaction.user.tag}` : `No reason was provided for the ${interaction.options.getBoolean("soft_ban", false) ? "soft " : ""}ban by ${interaction.user.tag}`);
        }
        else await interaction.guild.members.ban(user.id, { deleteMessageSeconds: 60 * 60 * 24 * delete_messages, reason: reason ? `${reason} • ${interaction.user.tag}` : `No reason was provided for the ${interaction.options.getBoolean("soft_ban", false) ? "soft " : ""}ban by ${interaction.user.tag}` });
        await infraction_message.ConfirmationMessage(interaction.channel);
        await setTimeout(300);
        await infraction_message.SendWebhook("Private");
        await infraction_message.SendWebhook("Public");

        return void await interaction.followUp({ content: `**${user.tag}** was ${interaction.options.getBoolean("soft_ban", false) ? "soft " : ""}banned in **${interaction.guild.name}**!`, ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "remove") {
        if (!await MemberBannedStatus(interaction.guild, user.id)) return void await Blossom.CreateInteractionError(interaction, `The user you entered is not banned in ${interaction.guild.name}.`);

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
            Reason: reason ?? `No reason was provided for the ban removal by ${interaction.user.tag}`,
            RemovalReason: "",
            RemovalStaffID: "",
            RemovalStaffUsername: "",
            StaffID: interaction.user.id,
            StaffUsername: interaction.user.tag,
            TargetID: user.id,
            TargetUsername: user.tag,
            Type: "BanRemove"
        });

        const infraction_message = new InfractionMessage({
            client: client,
            guild: interaction.guild,
            infraction: infraction,
            type: "BanRemove"
        });

        await infraction_message.SendDM();
        await setTimeout(300);
        await interaction.guild.members.unban(user.id, reason ? `${infraction.Reason} • ${interaction.user.tag}` : `No reason was provided for the ban removal by ${interaction.user.tag}`);
        await infraction_message.ConfirmationMessage(interaction.channel);
        await setTimeout(300);
        await infraction_message.SendWebhook("Private");
        await infraction_message.SendWebhook("Public");

        return void await interaction.followUp({ content: `**${user.tag}**'s ban was removed in **${interaction.guild.name}**!`, ephemeral: true });
    };
};

export function autocomplete({ client, handler, interaction }: AutocompleteProps): undefined {
    if (interaction.options.getSubcommand() === "remove") return;
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