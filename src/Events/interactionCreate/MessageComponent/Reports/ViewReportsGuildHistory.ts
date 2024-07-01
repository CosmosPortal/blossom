import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { ActionName, Blossom, FormatReport, Sentry, type ReportType } from "../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || !interaction.customId.startsWith("ViewReportsGuildHistory")) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const custom_id = interaction.customId.split("_");
    const type = custom_id[1] as ReportType;
    const is_inactive = custom_id[2] === "true" ? false : true;

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitReportGuildHistory",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: `ExportReportGuildData_${type}`,
        style: ButtonStyle.Secondary,
        label: "Export Data"
    })
    .CreateRegularButton({
        custom_id: `ViewReportGuildHistory_${type}_${is_inactive}`,
        style: ButtonStyle.Secondary,
        label: `Show ${is_inactive ? "Active Only" : "Inactive"}`
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: `ViewReportGuildHistoryType_${is_inactive}`,
        select_options: [
            {
                label: "Message Report",
                value: "MessageReport",
                default: type === "MessageReport"
            },
            {
                label: "User Report",
                value: "UserReport",
                default: type === "UserReport"
            }
        ],
        placeholder: "Report Types"
    }).BuildActionRow();

    const reports = await FormatReport(interaction.guild.id, {
        is_inactive: is_inactive,
        type: type
    });
    if (!reports) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} doesn't have any ${ActionName[type].toLowerCase()} action IDs that exist. To view inactive action IDs, make sure \`is_inactive\` option is toggle to \`true\`.`);

    const embed_one = new EmbedBuilder()
    .setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 4096 }))
    .setDescription(reports)
    .setColor(Blossom.DefaultHex());

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};