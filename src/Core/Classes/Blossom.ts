import { RoleManager } from "../Entities";
import { FindOrCreateEntity } from "../Functions";
import type { APIEmbed } from "discord-api-types/v10";
import type { ContextMenuCommandInteraction, Guild, RepliableInteraction, User } from "discord.js";

export class Blossom {
    /**
     * Creates an interaction ephemeral response to be used for the error system
     * @param {RepliableInteraction | ContextMenuCommandInteraction} interaction - Your interaction class for creating the interaction response
     * @param {string} message - The error message
     * @param {number} error_color - The error color
     * 
     * @example
     * ```ts
     * await Blossom.CreateInteractionError(interaction, "You are unauthorized to use Blossom."");
     * ```
     */
    public static async CreateInteractionError(interaction: RepliableInteraction | ContextMenuCommandInteraction, message: string, error_color: number = 0xFFB7C5): Promise<undefined> {
        if (interaction.deferred || interaction.replied) return void await interaction.followUp({ embeds: [this.CreateErrorEmbed(message, error_color)], ephemeral: true });
        else return void await interaction.reply({ embeds: [this.CreateErrorEmbed(message, error_color)], ephemeral: true });
    };

    /**
     * Returns Blossom default hex code, can be changed for holidays
     * 
     * @example
     * ```ts
     * Blossom.DefaultHex();
     * ```
     */
    public static DefaultHex(): number {
        return 0xFFB7C5;
    };

    /**
     * Checks if a user is a guild staff member
     * @param {Guild} guild - Your guild class to gather information
     * @param {User} user - Your user class to gather information
     * 
     * @example
     * ```ts
     * const is_staff = await Blossom.IsGuildStaffMember(interaction.guild, interaction.user);
     * ```
     */
    public static async IsGuildStaffMember(guild: Guild, user: User): Promise<boolean> {
        const member = await guild.members.fetch(user.id).catch(() => { return undefined });
        if (!member) return false;

        const member_roles = member.roles.cache.map((role) => role.id);
        const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: guild.id });
        const guild_owner = role_manager.StaffTeamGuildOwner.split(", ");
        const guild_manager = role_manager.StaffTeamGuildManager.split(", ");
        const guild_moderator = role_manager.StaffTeamGuildModerator.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager, guild_moderator);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    /**
     * Creates an embed to be used in the error system
     * @param {string} message - The error message to use in the embed description
     * @param {number} error_color - The error color to use in the embed color
     */
    private static CreateErrorEmbed(message: string, error_color: number = 0xFFB7C5): APIEmbed {
        const data: APIEmbed = {
            description: message,
            color: error_color
        };

        return data;
    };
};