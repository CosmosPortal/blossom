import { ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, RoleManager, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isButton() || interaction.customId !== "ViewPluginRoleManagerPage1") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.HasGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to members of the Management Team in ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: interaction.guild.id });
    const guild_roles = interaction.guild.roles.cache.map((role) => role.id);
    const guild_owner = role_manager.StaffTeamGuildOwner.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_manager = role_manager.StaffTeamGuildManager.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_application_manager = role_manager.StaffTeamGuildAppManager.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);
    const guild_moderator = role_manager.StaffTeamGuildModerator.split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n### Owner\n${role_manager.StaffTeamGuildOwner === "0" || guild_owner.length === 0 ? "Add Roles?" : guild_owner.join(" | ")}\n### Server Manager\n${role_manager.StaffTeamGuildManager === "0" || guild_manager.length === 0 ? "Add Roles?" : guild_manager.join(" | ")}\n### Application Manager\n${role_manager.StaffTeamGuildAppManager === "0" || guild_application_manager.length === 0 ? "Add Roles?" : guild_application_manager.join(" | ")}\n### Moderator\n${role_manager.StaffTeamGuildModerator === "0" || guild_moderator.length === 0 ? "Add Roles?" : guild_moderator.join(" | ")}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginRoleManagerPage1",
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
        custom_id: "ViewPluginRoleManagerPage2",
        style: ButtonStyle.Primary,
        label: "Next"
    }).BuildActionRow();

    const action_row_two = new StringSelectMenuBuilder({
        custom_id: "ViewRoleManagerStaffRole",
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
        custom_id: "ViewPluginHome",
        style: ButtonStyle.Secondary,
        label: "Home"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal",
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two, action_row_three] });
};