import { RoleSelectMenuBuilder } from "@cosmosportal/blossom.utils";
import { EmbedBuilder, type Client, type MessageComponentInteraction } from "discord.js";
import { Blossom, FindOrCreateEntity, GuildRole, RoleType, Sentry } from "../../../../../Core";
import type { CommandKit } from "commandkit";

export default async function (interaction: MessageComponentInteraction, client: Client<true>, handler: CommandKit): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isStringSelectMenu() || interaction.customId !== "EditGuildRoleStaffRole") return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (interaction.user.id !== interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `This feature is restricted to the creator of ${interaction.guild.name}.`);

    await interaction.deferReply({ ephemeral: true });

    const guild_role = await FindOrCreateEntity(GuildRole, { Snowflake: interaction.guild.id });
    const guild_roles = interaction.guild.roles.cache.map((role) => role.id);
    const guild_staff_roles = guild_role[`StaffTeam${interaction.values[0]}` as keyof GuildRole].split(", ").filter((x) => guild_roles.includes(x)).map((x) => `<@&${x}>`);

    const embed_one = new EmbedBuilder()
    .setDescription(`## Overview\n### ${RoleType[interaction.values[0] as keyof typeof RoleType]}\n${guild_role[`StaffTeam${interaction.values[0]}` as keyof GuildRole] === "0" || guild_staff_roles.length === 0 ? "Add Roles?" : guild_staff_roles.join(" | ")}`)
    .setColor(Blossom.DefaultHex());

    const action_row_one = new RoleSelectMenuBuilder({
        custom_id: `EditGuildRoleStaffRoles_${interaction.values[0]}`,
        max_values: 5,
        placeholder: `Select roles for ${RoleType[interaction.values[0] as keyof typeof RoleType].toLowerCase()}`
    }).BuildActionRow();

    return void await interaction.followUp({ embeds: [embed_one], components: [action_row_one], ephemeral: true });
};