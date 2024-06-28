import { DataSource } from "typeorm";
import { AccountSecurity, AppealSetting, Developer, GuildID, GuildSystem, InfractionSystem, LoggingSetting, MemberID, ModerationSetting, ReportSetting, ReportSystem, RoleManager } from "../Entities";

export const Database = new DataSource({
    type: "sqlite",
    database: "./storage/database.sqlite",
    entities: [ AccountSecurity, AppealSetting, Developer, GuildID, GuildSystem, InfractionSystem, LoggingSetting, MemberID, ModerationSetting, ReportSetting, ReportSystem, RoleManager ],
    logging: false,
    synchronize: true,
    // migrations: ["dist/Core/Migrations/*.js"]
});

export const Connect = async () => await  Database.initialize();