import { ActivityType, type Client } from "discord.js";
import { DatabaseConnect } from "../../Core";
import { version } from "../../../package.json";
import type { CommandKit } from "commandkit";

export default async function (client: Client<true>, handler: CommandKit): Promise<undefined> {
    client.user.setActivity({ name: `/changelog • v${version}`, type: ActivityType.Playing });

    console.log(`[Client Login] | Login as ${client.user.username} | v${version}`);
    await DatabaseConnect();
    console.log(`[Database Connected] | ${client.user.username} is connected to TypeORM`);
};