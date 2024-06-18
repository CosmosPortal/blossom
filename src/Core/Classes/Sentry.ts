import type { Client, Guild, GuildMember } from "discord.js";
import type { Snowflake } from "../Types";
import { AccountSecurity, Developer, GuildRole } from "../Entities";
import { AuthorizationLevel } from "../Enums";
import { FindOrCreateEntity } from "../Functions";

export class Sentry {
    /**
     * Checks if a member is able to use Blossom management commands
     * @param {Guild} guild - Your guild class to gather information
     * @param {GuildMember} member - Your guild member class to gather information
     * 
     * @example
     * ```ts
     * await Sentry.BlossomGuildManagementAuthorization(interaction.guild, interaction.member);
     * ```
     */
    public static async BlossomGuildManagementAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const guild_role = await FindOrCreateEntity(GuildRole, { Snowflake: guild.id });
        const guild_owner = guild_role.StaffTeamGuildOwner.split(", ");
        const guild_manager = guild_role.StaffTeamGuildManager.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    /**
     * Checks if a member is able to use Blossom moderation commands
     * @param {Guild} guild - Your guild class to gather information
     * @param {GuildMember} member - Your guild member class to gather information
     * 
     * @example
     * ```ts
     * await Sentry.BlossomGuildModerationAuthorization(interaction.guild, interaction.member);
     * ```
     */
    public static async BlossomGuildModerationAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const guild_role = await FindOrCreateEntity(GuildRole, { Snowflake: guild.id });
        const guild_owner = guild_role.StaffTeamGuildOwner.split(", ");
        const guild_manager = guild_role.StaffTeamGuildManager.split(", ");
        const guild_moderator = guild_role.StaffTeamGuildModerator.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager, guild_moderator);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    /**
     * Checks if a member is able to edit Blossom's guild settings
     * @param {Guild} guild - Your guild class to gather information
     * @param {GuildMember} member - Your guild member class to gather information
     * 
     * @example
     * ```ts
     * await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member);
     * ```
     */
    public static async BlossomGuildSettingAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const guild_role = await FindOrCreateEntity(GuildRole, { Snowflake: guild.id });
        const guild_owner = guild_role.StaffTeamGuildOwner.split(", ");
        const guild_manager = guild_role.StaffTeamGuildManager.split(", ");
        const guild_application_manager = guild_role.StaffTeamGuildAppManager.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager, guild_application_manager);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    /**
     * Checks if the snowflake is able to use Blossom
     * @param {Snowflake} snowflake - The snowflake to check
     * 
     * @example
     * ```ts
     * await Sentry.IsAuthorized(interaction.guild.id);
     * ```
     */
    public static async IsAuthorized(snowflake: Snowflake): Promise<boolean> {
        const account_security = await FindOrCreateEntity(AccountSecurity, { Snowflake: snowflake });

        return account_security.AuthorizationLevel === AuthorizationLevel.Authorized || account_security.AuthorizationLevel === AuthorizationLevel.BypassAuthorization;
    };

    /**
     * Checks if the maintenance mode is enabled, if enabled checks if the snowflake is able to use Blossom during maintenance
     * @param {Client<true>} client - Your client class to gather information
     * @param {Snowflake} snowflake - The snowflake to check
     * 
     * @example
     * ```ts
     * await Sentry.MaintenanceModeStatus(client, interaction.user.id);
     * ```
     */
    public static async MaintenanceModeStatus(client: Client<true>, snowflake?: Snowflake): Promise<boolean> {
        const developer = await FindOrCreateEntity(Developer, { Snowflake: client.user.id });
        if (!snowflake) return developer.MaintenanceModeStatus;

        const account_security = await FindOrCreateEntity(AccountSecurity, { Snowflake: snowflake });
        const bypass_authorization = account_security.AuthorizationLevel === AuthorizationLevel.BypassAuthorization ? false : true;

        return !developer.MaintenanceModeStatus ? false : !bypass_authorization;
    };
};