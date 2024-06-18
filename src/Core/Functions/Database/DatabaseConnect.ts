import { Database } from "../../Classes";

/**
 * Connects to the TypeORM database
 */
export async function DatabaseConnect(): Promise<void> {
    if (Database.isInitialized) return;

    await Database.initialize();

    if (!Database.isInitialized) await Database.initialize();
};