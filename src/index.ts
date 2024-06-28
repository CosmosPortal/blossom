import "dotenv/config";
import { CommandKit } from "commandkit";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import * as path from "node:path";

const client = new Client<true>({
    intents: [ GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent ],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User ],
    allowedMentions: { parse: [] }
});

new CommandKit({
    client,
    commandsPath: path.join(__dirname, "Commands"),
    eventsPath: path.join(__dirname, "Events")
});

client.login(process.env.CLIENT_TOKEN);