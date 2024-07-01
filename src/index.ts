import "dotenv/config";
import { CommandKit } from "commandkit";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { join } from "node:path";
import { Connect } from "./Core";

const client = new Client<true>({
    intents: [ GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent ],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User ],
    allowedMentions: { parse: [] }
});

new CommandKit({
    client,
    commandsPath: join(__dirname, "Commands"),
    eventsPath: join(__dirname, "Events")
});

async function BlossomLogin() {
    await Connect();
    console.log(`[Database Connected] | ${client.user.username} is connected to TypeORM`);
    await client.login(process.env.CLIENT_TOKEN);
};

BlossomLogin();