import { ChatInputCommandBuilder, CompareRolePosition, MemberHasPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } from "discord.js";
import { Blossom, FindOrCreateEntity, ModerationSetting, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "role",
    description: "Adds or removes a role",
    options: [
        {
            name: "add",
            description: "Adds a role to a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "The member to add the role to",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "role",
                    description: "The role to add to the member",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                },
                {
                    name: "reason",
                    description: "The reason for adding the role",
                    type: ApplicationCommandOptionType.String,
                    max_length: 250,
                    min_length: 5
                }
            ]
        },
        {
            name: "remove",
            description: "Removes a role from a member",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "member",
                    description: "The member to remove the role from",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "role",
                    description: "The role to remove from the member",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                },
                {
                    name: "reason",
                    description: "The reason for removing the role",
                    type: ApplicationCommandOptionType.String,
                    max_length: 250,
                    min_length: 5
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
    if (!await Sentry.HasManagementAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> is restricted to members of the Management Team in ${interaction.guild.name}.`);

    const moderation_setting = await FindOrCreateEntity(ModerationSetting, { Snowflake: interaction.guild.id });
    const member = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason", false);
    const guild_client = await interaction.guild.members.fetchMe().catch(() => { return undefined });

    await interaction.deferReply({ ephemeral: true });

    if (moderation_setting.RequireReason && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>.`);
    if (!member) return void await Blossom.CreateInteractionError(interaction, `The member you entered is no longer a member of ${interaction.guild.name}.`);
    if (!guild_client) return void await Blossom.CreateInteractionError(interaction, `An issue occured with fetching ${client.user.username}.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.ManageRoles ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}>. Ensure ${client.user.username} has **Manage Roles** permission in ${interaction.guild.name}.`);
    if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on yourself.`);
    if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on ${client.user.username}.`);
    if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName} ${interaction.options.getSubcommand()}:${interaction.commandId}> on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    if (interaction.options.getSubcommand() === "add") {
        const role = interaction.options.getRole("role", true);
        if (role.managed) return void await Blossom.CreateInteractionError(interaction, "The role you entered cannot be assigned as it's managed by Discord or another application.");
        if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position < role.position) return void await Blossom.CreateInteractionError(interaction, "The role you entered has a higher position than you.");
        if (guild_client.roles.highest.position < role.position) return void await Blossom.CreateInteractionError(interaction, `The role you entered has a higher position than ${client.user.username}.`);
        if (member.roles.cache.has(role.id)) return void await Blossom.CreateInteractionError(interaction, `The member you entered already has the <@&${role.id}> role.`);

        await member.roles.add(role, reason ? `${reason} • ${interaction.user.tag}` : `No reason was provided for assigning the role by ${interaction.user.tag}`);

        const embed_one = new EmbedBuilder()
        .setDescription(`You have given the <@&${role.id}> role to **${member.user.tag}**.`)
        .setColor(Blossom.DefaultHex());

        return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
    };

    if (interaction.options.getSubcommand() === "remove") {
        const role = interaction.options.getRole("role", true);
        if (role.managed) return void await Blossom.CreateInteractionError(interaction, "The role you entered cannot be unassigned as it's managed by Discord or another application.");
        if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position < role.position) return void await Blossom.CreateInteractionError(interaction, "The role you entered has a higher position than you.");
        if (guild_client.roles.highest.position < role.position) return void await Blossom.CreateInteractionError(interaction, `The role you entered has a higher position than ${client.user.username}.`);
        if (!member.roles.cache.has(role.id)) return void await Blossom.CreateInteractionError(interaction, `The member you entered doesn't have the <@&${role.id}> role.`);

        await member.roles.remove(role, reason ? `${reason} • ${interaction.user.tag}` : `No reason was provided for unassigning the role by ${interaction.user.tag}`);

        const embed_one = new EmbedBuilder()
        .setDescription(`You have removed the <@&${role.id}> role from **${member.user.tag}**.`)
        .setColor(Blossom.DefaultHex());

        return void await interaction.followUp({ embeds: [embed_one], ephemeral: true });
    };
};