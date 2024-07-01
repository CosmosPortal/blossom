import { ButtonBuilder, RoleSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { ButtonStyle, EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, RoleManager, RoleName, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "ViewRoleManagerStaffRole") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (interaction.user.id !== interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to the creator of ${interaction.guild.name}.`);

    await interaction.deferUpdate();

    const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: interaction.guild.id });
    const guild_roles = interaction.guild.roles.cache.map((role) => role.id);
    const guild_staff_roles = role_manager[`StaffTeam${interaction.values[0]}` as keyof RoleManager].split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n### ${RoleName[interaction.values[0] as keyof typeof RoleName]}\n${role_manager[`StaffTeam${interaction.values[0]}` as keyof RoleManager] === "0" || guild_staff_roles.length === 0 ? "Add Roles?" : guild_staff_roles.join(" | ")}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new RoleSelectMenuBuilder({
        custom_id: `EditRoleManagerStaffRole_${interaction.values[0]}`,
        max_values: 5,
        placeholder: `Select roles for ${RoleName[interaction.values[0] as keyof typeof RoleName].toLowerCase()}`
    }).BuildActionRow();

    const action_row_two = new ButtonBuilder()
    .CreateRegularButton({
        custom_id: "ViewPluginRoleManagerPage1",
        style: ButtonStyle.Secondary,
        label: "Back"
    })
    .CreateRegularButton({
        custom_id: `ResetRoleManagerStaffRole_${interaction.values[0]}`,
        style: ButtonStyle.Secondary,
        disabled: role_manager[`StaffTeam${interaction.values[0]}` as keyof RoleManager] === "0" || guild_staff_roles.length === 0,
        label: "Reset?"
    })
    .CreateLinkButton({
        custom_id: "https://github.com/CosmosPortal/blossom#readme",
        style: ButtonStyle.Link,
        label: "Documentation"
    }).BuildActionRow();

    return void await interaction.editReply({ embeds: [embed_one], components: [action_row_one, action_row_two] });
};