import { DataSource } from "typeorm";
import { AccountSecurity, Developer, GuildID, GuildModerationSetting, GuildRole, GuildSystem, InfractionSystem, MemberID } from "../Entities";

export const Database = new DataSource({
    type: "sqlite",
    database: "./storage/database.sqlite",
    entities: [ AccountSecurity, Developer, GuildID, GuildModerationSetting, GuildRole, GuildSystem, InfractionSystem, MemberID ],
    logging: false,
    synchronize: false,
    migrations: ["dist/Core/Migrations/*.js"]
});

export const Connect = async () => await  Database.initialize();