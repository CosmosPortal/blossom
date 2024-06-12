import { ButtonManager, StringSelectMenuManager } from "@cosmosportal/blossom.utils";
import { ApplicationCommandType, ButtonStyle, EmbedBuilder } from "discord.js";
import { Blossom, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = {
    name: "config",
    description: "Configure Blossom for your server",
    type: ApplicationCommandType.ChatInput,
    dm_permission: false
};

export async function run({ client, handler, interaction }: SlashCommandProps) {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return;
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> is restricted to members of the Management Team in ${interaction.guild.name}.`);

    const embed_one = new EmbedBuilder()
    .setDescription(`### ${client.user.username}'s Setting for ${interaction.guild.name}\nSelect a plugin to edit using the menu below. To control who can view commands, go to **Server Settings** > **Integrations** > **${client.user.username}**.`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new StringSelectMenuManager()
    .CreateSelectMenu({
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
                value: "ServerRole",
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
    })
    .BuildActionRow();

    const action_row_two = new ButtonManager()
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
    })
    .BuildActionRow();

    return void await interaction.reply({ embeds: [embed_one], components: [action_row_one, action_row_two], ephemeral: true });
};