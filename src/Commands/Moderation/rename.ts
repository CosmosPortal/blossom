import { ChatInputCommandBuilder, CompareRolePosition, MemberHasPermissions } from "@cosmosportal/blossom.utils";
import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import { Blossom, FindOrCreateEntity, GuildModerationSetting, Sentry } from "../../Core";
import type { CommandData, SlashCommandProps } from "commandkit";

export const data: CommandData = new ChatInputCommandBuilder({
    name: "rename",
    description: "Changes a member's nickname",
    options: [
        {
            name: "member",
            description: "The member you want to rename",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "nickname",
            description: "The member's new nickname",
            type: ApplicationCommandOptionType.String,
            max_length: 32,
            min_length: 1
        },
        {
            name: "reason",
            description: "The reason for renaming the member",
            type: ApplicationCommandOptionType.String,
            max_length: 250,
            min_length: 5
        }
    ],
    dm_permission: false
}).BuildCommand();

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<undefined> {
    if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
    if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
    if (!await Sentry.IsAuthorized(interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} is unauthorized to use ${client.user.username}.`);
    if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
    if (!await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> is restricted to members of the Moderation Team in ${interaction.guild.name}.`);

    const guild_moderation_setting = await FindOrCreateEntity(GuildModerationSetting, { Snowflake: interaction.guild.id });
    const member = interaction.options.getMember("member");
    const reason = interaction.options.getString("reason", false);

    await interaction.deferReply({ ephemeral: true });

    if (guild_moderation_setting.RequireReason === true && !reason) return void await Blossom.CreateInteractionError(interaction, `${interaction.guild.name} requires you to enter a reason for </${interaction.commandName}:${interaction.commandId}>. Use the \`reason\` option in </${interaction.commandName}:${interaction.commandId}>.`);
    if (!member) return void await Blossom.CreateInteractionError(interaction, `The member you entered is no longer a member of ${interaction.guild.name}.`);
    if (!await MemberHasPermissions(interaction.guild, client.user.id, [ PermissionsBitField.Flags.ManageNicknames ])) return void await Blossom.CreateInteractionError(interaction, `${client.user.username} doesn't have enough permission to run </${interaction.commandName}:${interaction.commandId}>. Ensure ${client.user.username} has **Manage Nicknames** permission in ${interaction.guild.name}.`);
    if (member.id === interaction.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on yourself.`);
    if (member.id === client.user.id) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on ${client.user.username}.`);
    if (member.id === interaction.guild.ownerId) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on <@${interaction.guild.ownerId}>.`);
    if (interaction.user.id !== interaction.guild.ownerId && !await CompareRolePosition(interaction.guild, interaction.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `You cannot run </${interaction.commandName}:${interaction.commandId}> on a member with a higher role than you.`);
    if (!await CompareRolePosition(interaction.guild, client.user.id, member.id, true)) return void await Blossom.CreateInteractionError(interaction, `The member you entered has a higher role than ${client.user.username}.`);

    await member.setNickname(interaction.options.getString("nickname", false), reason ? `${reason} • ${interaction.user.tag}` : `No reason was provided for the nickname change by ${interaction.user.tag}`);

    return void await interaction.followUp({ content: `**${member.user.tag}** nickname was ${interaction.options.getString("nickname", false) ? `changed to ${interaction.options.getString("nickname", false)}` : "reset"} in **${interaction.guild.name}**!`, ephemeral: true });
};