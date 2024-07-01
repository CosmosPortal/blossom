import { DataSource } from "typeorm";

export const Database = new DataSource({
    type: "sqlite",
    database: "./storage/database.sqlite",
    entities: ["dist/Core/Entities/*-entity.js"],
    logging: false,
    synchronize: false,
    // migrations: ["dist/Core/Migrations/*.js"]
});

export const Connect = async () => await  Database.initialize();