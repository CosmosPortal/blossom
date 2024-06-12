import { DataSource } from "typeorm";
import { AccountSecurity, Developer, GuildModerationSetting, GuildRole } from "../Entities";

export const Database = new DataSource({
    type: "sqlite",
    database: "./storage/database.sqlite",
    entities: [ AccountSecurity, Developer, GuildModerationSetting, GuildRole ],
    logging: false,
    synchronize: true
});