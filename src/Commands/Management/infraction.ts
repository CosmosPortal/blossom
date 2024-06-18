import { ButtonBuilder, ChatInputCommandBuilder, ModalBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ButtonStyle, EmbedBuilder, TextInputStyle } from "discord.js";
import { ActionType, Blossom, Color, FindOneEntity, FindOrCreateEntity, FormatGuildInfractions, GuildModerationSetting, InfractionSystem, Sentry, type InfractionType } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "infraction",
    description: "View, modify, or get a list of infractions",
    options: [
        {
            name: "list",
            description: "Searches the server for all action IDs for a certain infraction",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "type",
                    description: "The type of infraction to list",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "BanAdd", value: "BanAdd" },
                        { name: "BanRemove", value: "BanRemove" },
                        { name: "BanSoft", value: "BanSoft" },
                        { name: "Kick", value: "Kick" },
                        { name: "TimeoutAdd", value: "TimeoutAdd" },
                        { name: "TimeoutRemove", value: "TimeoutRemove" },
                        { name: "WarnAdd", value: "WarnAdd" }
                    ],
                    required: true
                },
                {
                    name: "is_inactive",
                    description: "If true, returns inactive action IDs as well",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        },
        {
            name: "modify",
            description: "Modify an infraction data",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "action_id",
                    description: "The infraction action ID to modify",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "alter",
                    description: "What would you like to modify?",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "Mark as Active", value: "MarkActive" },
                        { name: "Mark as Inactive", value: "MarkInactive" },
                        { name: "Reason", value: "Reason" },
                        { name: "Removal Reason", value: "RemovalReason" }
                    ],
                    required: true
                }
            ]
        },
        {
            name: "view",
            description: "View an infraction information",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "action_id",
                    description: "The infraction action ID to view",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "is_inactive",
                    description: "If true, returns inactive action ID information as well",
                    type: ApplicationCommandOptionType.Boolean
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
    if (!await Sentry.BlossomGuildManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> is restricted to members of the Management Team in ${interaction.guild.name}.`);

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });

    if (interaction.options.getSubcommand() === "list") {
        await interaction.deferReply({ ephemeral: true });

        const infraction_history = await FormatGuildInfractions(interaction.guild.id, interaction.options.getString("type", true) as InfractionType, interaction.options.getBoolean("is_inactive", false) ?? false);
        if (!infraction_history) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any ${ActionType[interaction.options.getString("type", true) as InfractionType].toLowerCase()} action IDs that exist. To view inactive action IDs, make sure \`is_inactive\` option is toggle to \`true\`.`);

        const embed_one = new EmbedBuilder()
        .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
        .setDescription(infraction_history)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "ExitInfractionGuildHistory",
            style: ButtonStyle.Secondary,
            label: "Exit"
        })
        .CreateRegularButton({
            custom_id: `ExportInfractionGuildData_${interaction.options.getString("type", true)}`,
            style: ButtonStyle.Secondary,
            label: "Export Data"
        })
        .CreateRegularButton({
            custom_id: `ViewInfractionGuildHistory_${interaction.options.getString("type", true)}_${interaction.options.getBoolean("is_inactive", false) ?? false}`,
            style: ButtonStyle.Secondary,
            label: `Show ${interaction.options.getBoolean("is_inactive", false) ? "Active Only" : "Inactive"}`
        }).BuildActionRow();
    
        const action_row_two = new StringSelectMenuBuilder({
            custom_id: `ViewInfractionGuildHistoryType_${interaction.options.getBoolean("is_inactive", false) ?? false}`,
            select_options: [
                {
                    label: "BanAdd",
                    value: "BanAdd",
                    default: interaction.options.getString("type", true) === "BanAdd"
                },
                {
                    label: "BanRemove",
                    value: "BanRemove",
                    default: interaction.options.getString("type", true) === "BanRemove"
                },
                {
                    label: "BanSoft",
                    value: "BanSoft",
                    default: interaction.options.getString("type", true) === "BanSoft"
                },
                {
                    label: "Kick",
                    value: "Kick",
                    default: interaction.options.getString("type", true) === "Kick"
                },
                {
                    label: "TimeoutAdd",
                    value: "TimeoutAdd",
                    default: interaction.options.getString("type", true) === "TimeoutAdd"
                },
                {
                    label: "TimeoutRemove",
                    value: "TimeoutRemove",
                    default: interaction.options.getString("type", true) === "TimeoutRemove"
                },
                {
                    label: "WarnAdd",
                    value: "WarnAdd",
                    default: interaction.options.getString("type", true) === "WarnAdd"
                }
            ],
            placeholder: "Infraction Types"
        }).BuildActionRow();

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one, action_row_two], ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "modify") {
        const action_id = interaction.options.getString("action_id", true);
        const infraction = await FindOneEntity(InfractionSystem, { ActionID: action_id, InfractionGuildID: interaction.guild.id });
        if (!infraction) return void await Blossom.CreateInteractionError(interaction, `The action ID you entered doesn't exist in ${interaction.guild.name}.`);

        if (interaction.options.getString("alter", true) === "MarkActive") {
            if (infraction.Active) return void await Blossom.CreateInteractionError(interaction, "You cannot mark the aciton ID as active due to it being active already.");

            const modal_response = new ModalBuilder({
                custom_id: `EditInfractionMarkActive_${action_id}`,
                title: "Management System | Editor"
            })
            .CreateTextInput({
                custom_id: "reason",
                label: "Reason for marking this action as active?",
                style: TextInputStyle.Paragraph,
                max_length: 250,
                min_length: 5,
                placeholder: "Please provide a reason for marking this action ID as active",
                required: true
            }).BuildResponse();

            return void await interaction.showModal(modal_response);
        };

        if (interaction.options.getString("alter", true) === "MarkInactive") {
            if (!infraction.Active) return void await Blossom.CreateInteractionError(interaction, "You cannot mark the aciton ID as inactive due to it being inactive already.");

            const modal_response = new ModalBuilder({
                custom_id: `EditInfractionMarkInactive_${action_id}`,
                title: "Management System | Editor"
            })
            .CreateTextInput({
                custom_id: "reason",
                label: "Reason for marking this action as inactive?",
                style: TextInputStyle.Paragraph,
                max_length: 250,
                min_length: 5,
                placeholder: "Please provide a reason for marking this action ID as inactive",
                required: true
            }).BuildResponse();

            return void await interaction.showModal(modal_response);
        };

        if (interaction.options.getString("alter", true) === "Reason") {
            if (!infraction.Active) return void await Blossom.CreateInteractionError(interaction, "You cannot edit a reason for an action ID that is marked as inactive.");

            const modal_response = new ModalBuilder({
                custom_id: `EditInfractionReason_${action_id}`,
                title: "Management System | Editor"
            })
            .CreateTextInput({
                custom_id: "reason",
                label: "Reason Editor",
                style: TextInputStyle.Paragraph,
                max_length: 250,
                min_length: 5,
                required: true,
                value: infraction.Reason
            }).BuildResponse();

            return void await interaction.showModal(modal_response);
        };

        if (interaction.options.getString("alter", true) === "RemovalReason") {
            if (infraction.Active) return void await Blossom.CreateInteractionError(interaction, "You cannot edit a removal reason for an action ID that is marked as active.");

            const modal_response = new ModalBuilder({
                custom_id: `EditInfractionRemovalReason_${action_id}`,
                title: "Management System | Editor"
            })
            .CreateTextInput({
                custom_id: "reason",
                label: "Reason Editor",
                style: TextInputStyle.Paragraph,
                max_length: 250,
                min_length: 5,
                required: true,
                value: infraction.RemovalReason
            }).BuildResponse();

            return void await interaction.showModal(modal_response);
        };
    };

    if (interaction.options.getSubcommand() === "view") {
        await interaction.deferReply({ ephemeral: true });

        const action_id = interaction.options.getString("action_id", true);
        const infraction = await FindOneEntity(InfractionSystem, { ActionID: action_id, InfractionGuildID: interaction.guild.id });
        if (!infraction) return void await Blossom.CreateInteractionError(interaction, `The action ID you entered doesn't exist in ${interaction.guild.name}.`);

        const fields = [
            { name: "Moderation Information", value: `- **Action ID** • ${infraction.ActionID}\n- **Creation** • <t:${Math.trunc(Math.floor(Number(infraction.CreationTimestamp) / 1000))}:D>\n- **Status** • ${infraction.Active == true ? "Active" : "Inactive"}\n- **Staff Member** • ${infraction.StaffUsername} [\`${infraction.StaffID}\`]\n- **Target Member** • ${infraction.TargetUsername} [\`${infraction.TargetID}\`]` },
            { name: "Reason", value: infraction.Reason }
        ];

        if (infraction.RemovalReason && infraction.RemovalStaffID && infraction.RemovalStaffUsername) fields.push(
            { name: "Removal Information", value: `- **Staff Member** • ${infraction.RemovalStaffUsername} [\`${infraction.RemovalStaffID}\`]` },
            { name: "Removal Reason", value: infraction.RemovalReason }
        );

        const user = await client.users.fetch(infraction.TargetID).catch(() => { return undefined });
        if (!user) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching the target user. The user either no longer exist or ${client.user.username} couldn't fetch the user.`);

        const embed_one = new EmbedBuilder()
        .setThumbnail(user.displayAvatarURL({ forceStatic: false, size: 4096 }))
        .setAuthor({ name: `Case #${infraction.CaseID} | ${ActionType[infraction.Type as InfractionType]}` })
        .setFields(fields)
        .setColor(Color[infraction.Type as InfractionType]);

        return void await interaction.followUp({ embeds: [embed_one] });
    };
};