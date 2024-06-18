import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPluginSetting") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const embed_one = new EmbedBuilder()
    .setDescription(`### ${client.user.username}'s Setting for ${interaction.guild.name}\nSelect a plugin to edit using the menu below. To control who can view commands, go to **Server Settings** > **Integrations** > **${client.user.username}**.`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new StringSelectMenuBuilder({
        custom_id: "ManagePluginSetting",
        select_options: [
            {
                label: "Moderation",
                value: "Moderation",
                description: "A hub for server appeals, logging, reports, and more.",
                emoji: { name: "ModeratorProgramsAlumni", id: "1136567803424555128" }
            },
            {
                label: "Server Role",
                value: "GuildRole",
                description: "A tool for customizing server roles for specific features.",
                emoji: { name: "RoleBadge", id: "1198127296607957033" }
            },
            {
                label: "Ticket System",
                value: "TicketSystem",
                description: "A tool for managing the server ticket system.",
                emoji: { name: "IDCards", id: "1198136825693352047" }
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
        custom_id: "ViewPluginSetting",
        style: ButtonStyle.Secondary,
        disabled: true,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};