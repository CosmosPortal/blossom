import { ButtonBuilder, ChatInputCommandBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, ButtonStyle, EmbedBuilder } from "discord.js";
import { ActionTypeName, Blossom, FormatReport, Sentry, type ReportType } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "reports",
    description: "Get a list of reports",
    options: [
        {
            name: "list",
            description: "Searches the server for all action IDs for a certain report",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "type",
                    description: "The type of report to list",
                    type: ApplicationCommandOptionType.String,
                    choices: [
                        { name: "Message Report", value: "MessageReport" },
                        { name: "User Report", value: "UserReport" }
                    ],
                    required: true
                },
                {
                    name: "is_inactive",
                    description: "If true, returns inactive action IDs as well",
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
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    if (interaction.options.getSubcommand() === "list") {
        await interaction.deferReply({ ephemeral: true });

        const reports = await FormatReport(interaction.guild.id, {
            is_inactive: interaction.options.getBoolean("is_inactive", false) ?? false,
            type: interaction.options.getString("type", true) as ReportType
        });
        if (!reports) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any ${ActionTypeName[interaction.options.getString("type", true) as ReportType].toLowerCase()} action IDs that exist. To view inactive action IDs, make sure \`is_inactive\` option is toggle to \`true\`.`);

        const embed_one = new EmbedBuilder()
        .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
        .setDescription(reports)
        .setColor(Blossom.DefaultHex());

        const action_row_one = new ButtonBuilder()
        .CreateRegularButton({
            custom_id: "ExitReportsGuildHistory",
            style: ButtonStyle.Secondary,
            label: "Exit"
        })
        .CreateRegularButton({
            custom_id: `ExportReportsGuildData_${interaction.options.getString("type", true)}`,
            style: ButtonStyle.Secondary,
            label: "Export Data"
        })
        .CreateRegularButton({
            custom_id: `ViewReportsGuildHistory_${interaction.options.getString("type", true)}_${interaction.options.getBoolean("is_inactive", false) ?? false}`,
            style: ButtonStyle.Secondary,
            label: `Show ${interaction.options.getBoolean("is_inactive", false) ? "Active Only" : "Inactive"}`
        }).BuildActionRow();
    
        const action_row_two = new StringSelectMenuBuilder({
            custom_id: `ViewReportsGuildHistoryType_${interaction.options.getBoolean("is_inactive", false) ?? false}`,
            select_options: [
                {
                    label: "Message Report",
                    value: "MessageReport",
                    default: interaction.options.getString("type", true) === "MessageReport"
                },
                {
                    label: "User Report",
                    value: "UserReport",
                    default: interaction.options.getString("type", true) === "UserReport"
                }
            ],
            placeholder: "Report Types"
        }).BuildActionRow();

        return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one, action_row_two], ephemeral: true });
    };
};