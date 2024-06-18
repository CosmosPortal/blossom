import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, GuildRole, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "ManagePluginSetting" || interaction.values[0] !== "GuildRole") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const guild_role = await FindOrCreateEntity(GuildRole, { Snowflake: interaction.guild.id });
    const guild_roles = interaction.guild.roles.cache.map((role) => role.id);
    const guild_owner = guild_role.StaffTeamGuildOwner.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_manager = guild_role.StaffTeamGuildManager.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_application_manager = guild_role.StaffTeamGuildAppManager.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_moderator = guild_role.StaffTeamGuildModerator.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n### Owner\n${guild_role.StaffTeamGuildOwner === "0" || guild_owner.length === 0 ? "Add Roles?" : guild_owner.join(" | ")}\n### Server Manager\n${guild_role.StaffTeamGuildManager === "0" || guild_manager.length === 0 ? "Add Roles?" : guild_manager.join(" | ")}\n### Application Manager\n${guild_role.StaffTeamGuildAppManager === "0" || guild_application_manager.length === 0 ? "Add Roles?" : guild_application_manager.join(" | ")}\n### Moderator\n${guild_role.StaffTeamGuildModerator === "0" || guild_moderator.length === 0 ? "Add Roles?" : guild_moderator.join(" | ")}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPage1GuildRolePlugin",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: "undefined",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "1/2"
    })
    .CreateRegularButton({
        custom_id: "ViewPage2GuildRolePlugin",
        style: ButtonStyle.Primary,
        disabled: true,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "EditGuildRoleStaffRole",
        select_options: [
            {
                label: "Owner",
                value: "GuildOwner"
            },
            {
                label: "Server Manager",
                value: "GuildManager"
            },
            {
                label: "Application Manager",
                value: "GuildAppManager"
            },
            {
                label: "Moderator",
                value: "GuildModerator"
            }
        ],
        placeholder: "Pick a rank to edit"
    }).BuildActionRow();

    const action_row_three = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ExitPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Exit"
    })
    .CreateRegularButton({
        custom_id: "ViewPluginSetting",
        style: ButtonStyle.Secondary,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};