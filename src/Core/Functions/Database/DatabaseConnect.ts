import { Connect, Database } from "../../Classes";

/**
 * Connects to the TypeORM database
 */
export async function DatabaseConnect(): Promise<void> {
    if (Database.isInitialized) return;

    await Connect();

    if (!Database.isInitialized) await Connect();
};