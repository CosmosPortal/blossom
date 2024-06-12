import type { Client, Guild, GuildMember } from "discord.js";
import type { Snowflake } from "../Types";
import { AccountSecurity, Developer, GuildRole } from "../Entities";
import { AuthorizationLevel } from "../Enums";
import { FindOrCreateEntity } from "../Functions";

export class Sentry {
    public static async BlossomGuildSettingAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
        const member_roles = member.roles.cache.map((role) => role.id);
        const guild_role = await FindOrCreateEntity(GuildRole, { snowflake: guild.id });
        const guild_owner = guild_role.StaffTeamGuildOwner.split(", ");
        const guild_manager = guild_role.StaffTeamGuildManager.split(", ");
        const guild_bot_manager = guild_role.StaffTeamGuildBotManager.split(", ");
        const staff_team_roles = guild_owner.concat(guild_manager, guild_bot_manager);

        return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
    };

    public static async IsAuthorized(snowflake: Snowflake): Promise<boolean> {
        const account_security = await FindOrCreateEntity(AccountSecurity, { snowflake: snowflake });

        return account_security.AuthorizationLevel === AuthorizationLevel.Authorized || account_security.AuthorizationLevel === AuthorizationLevel.BypassAuthorization;
    };

    public static async MaintenanceModeStatus(client: Client<true>, snowflake?: Snowflake): Promise<boolean> {
        const developer = await FindOrCreateEntity(Developer, { snowflake: client.user.id });
        if (!snowflake) return developer.MaintenanceModeStatus;

        const account_security = await FindOrCreateEntity(AccountSecurity, { snowflake: snowflake });
        const bypass_authorization = account_security.AuthorizationLevel === AuthorizationLevel.BypassAuthorization ? false : true;

        return !developer.MaintenanceModeStatus ? false : !bypass_authorization;
    };
};