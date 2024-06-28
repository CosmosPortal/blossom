import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPluginHome") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const embed_one = new EmbedBuilder()
    .setDescription(`### ${client.user.username}'s Setting for ${interaction.guild.name}\nSelect a plugin to edit using the menu below. To control who can view commands, go to **Server Settings** > **Integrations** > **${client.user.username}**.`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new StringSelectMenuBuilder({
        custom_id: "ViewPluginSetting",
        select_options: [
            {
                label: "Appeal System",
                value: "AppealSystem",
                description: "Edit the settings for the appeal system.",
                emoji: { name: "Appeal", id: "1253793583593689130" }
            },
            {
                label: "Auto-Moderation",
                value: "AutoMod",
                description: "Adjust the server's auto-moderation settings.",
                emoji: { name: "AutoMod", id: "1253801410521333881" }
            },
            {
                label: "Daily Topics",
                value: "DailyTopics",
                description: "Manage daily topics for your server.",
                emoji: { name: "DailyTopics", id: "1253806109332996136" }
            },
            {
                label: "Logging System",
                value: "LoggingSystem",
                description: "Track all activities happening in your server.",
                emoji: { name: "Logging", id: "1253793552970940496" }
            },
            {
                label: "Moderation",
                value: "Moderation",
                description: "Edit the server's moderation settings.",
                emoji: { name: "Moderation", id: "1253801382037819533" }
            },
            {
                label: "Report System",
                value: "ReportSystem",
                description: "Modify the server's report system.",
                emoji: { name: "Report", id: "1253612604975484998" }
            },
            {
                label: "Role Manager",
                value: "RoleManager",
                description: "Customize server roles for specific features.",
                emoji: { name: "RoleBadge", id: "1198127296607957033" }
            },
            {
                label: "Suggestion",
                value: "Suggestion",
                description: "Adjust the settings for the suggestion system.",
                emoji: { name: "Suggestion", id: "1253810642968772668" }
            },
            {
                label: "Ticket System",
                value: "TicketSystem",
                description: "Manage the server's ticket system.",
                emoji: { name: "Ticket", id: "1253810893641486389" }
            }
        ],
        placeholder: "View Plugins"
    }).BuildActionRow();

    const action_row_two = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginHome",
        style: ButtonStyle.Secondary,
        disabled: true,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal/blossom#readme",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};