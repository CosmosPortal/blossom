import { AccountSecurity, Developer, RoleManager } from "../Entities";
import { AuthorizationLevel } from "../Enums";
import { FindOrCreateEntity } from "../Functions";
import type { Client, Guild, GuildMember } from "discord.js";
import type { Snowflake } from "../Types";

export class Sentry {
    /**
     * Checks if a member is able to edit Blossom's guild settings
     * @param {Guild} guild - Your guild class to gather information
     * @param {GuildMember} member - Your guild member class to gather information
     * 
     * @example
     * ```ts
     * await Sentry.HasGuildSettingAuthorization(guild, member);
     * ```
     */
    public static async HasGuildSettingAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: guild.id });
        const guild_owner = role_manager.StaffTeamGuildOwner.split(", ");
        const guild_manager = role_manager.StaffTeamGuildManager.split(", ");
        const guild_application_manager = role_manager.StaffTeamGuildAppManager.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager, guild_application_manager);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    /**
     * Checks if a member is able to use Blossom management commands
     * @param {Guild} guild - Your guild class to gather information
     * @param {GuildMember} member - Your guild member class to gather information
     * 
     * @example
     * ```ts
     * await Sentry.HasManagementAuthorization(guild, member);
     * ```
     */
    public static async HasManagementAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: guild.id });
        const guild_owner = role_manager.StaffTeamGuildOwner.split(", ");
        const guild_manager = role_manager.StaffTeamGuildManager.split(", ");
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
     * await Sentry.HasModerationAuthorization(guild, member);
     * ```
     */
    public static async HasModerationAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const role_manager = await FindOrCreateEntity(RoleManager, { Snowflake: guild.id });
        const guild_owner = role_manager.StaffTeamGuildOwner.split(", ");
        const guild_manager = role_manager.StaffTeamGuildManager.split(", ");
        const guild_moderator = role_manager.StaffTeamGuildModerator.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager, guild_moderator);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    /**
     * Checks if the snowflake is able to use Blossom
     * @param {Snowflake} snowflake - The snowflake to check
     * 
     * @example
     * ```ts
     * await Sentry.IsAuthorized(guild.id);
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
     * await Sentry.MaintenanceModeStatus(client, user.id);
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