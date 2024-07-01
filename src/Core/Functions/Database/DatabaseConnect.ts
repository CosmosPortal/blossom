import { Connect, Database } from "../../Classes";

/**
 * Connects to the TypeORM database
 * 
 * @example
 * ```ts
 * await DatabaseConnect();
 * ```
 */
export async function DatabaseConnect(): Promise<void> {
    if (Database.isInitialized) return;

    await Connect();

    if (!Database.isInitialized) throw new Error("[Database Connection Error] | Could not connect to TypeORM");
};