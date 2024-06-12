"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_config = require("dotenv/config");
var import_commandkit = require("commandkit");
var import_discord = require("discord.js");
var path = __toESM(require("path"));
var client = new import_discord.Client({
  intents: [
    import_discord.GatewayIntentBits.GuildMembers,
    import_discord.GatewayIntentBits.GuildMessages,
    import_discord.GatewayIntentBits.Guilds,
    import_discord.GatewayIntentBits.MessageContent
  ],
  partials: [
    import_discord.Partials.Channel,
    import_discord.Partials.GuildMember,
    import_discord.Partials.GuildScheduledEvent,
    import_discord.Partials.Message,
    import_discord.Partials.Reaction,
    import_discord.Partials.ThreadMember,
    import_discord.Partials.User
  ],
  allowedMentions: {
    parse: []
  }
});
new import_commandkit.CommandKit({
  client,
  commandsPath: path.join(__dirname, "Commands"),
  eventsPath: path.join(__dirname, "Events"),
  devGuildIds: [
    "1052139816499814471",
    "1136563432443875338"
  ],
  devUserIds: [
    "515989471645401088"
  ]
});
client.login(process.env.CLIENT_TOKEN);
