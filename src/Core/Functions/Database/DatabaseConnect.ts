import { Database } from "../../Classes";

export async function DatabaseConnect() {
    if (Database.isInitialized) return;

    await Database.initialize();

    if (!Database.isInitialized) await Database.initialize();
};