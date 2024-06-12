"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/Commands/Management/config.ts
var config_exports = {};
__export(config_exports, {
  data: () => data,
  run: () => run
});
module.exports = __toCommonJS(config_exports);
var import_blossom = require("@cosmosportal/blossom.utils");
var import_discord = require("discord.js");

// src/Core/Classes/Blossom.ts
var Blossom = class {
  static {
    __name(this, "Blossom");
  }
  static CreateErrorEmbed(message, error_color = 16758725) {
    const data2 = {
      description: message,
      color: error_color
    };
    return data2;
  }
  static async CreateInteractionError(interaction, message, error_color = 16758725) {
    if (interaction.deferred || interaction.replied) await interaction.followUp({
      embeds: [
        this.CreateErrorEmbed(message, error_color)
      ],
      ephemeral: true
    });
    else await interaction.reply({
      embeds: [
        this.CreateErrorEmbed(message, error_color)
      ],
      ephemeral: true
    });
  }
  static DefaultHex() {
    return 16758725;
  }
};

// src/Core/Classes/Database.ts
var import_typeorm5 = require("typeorm");

// src/Core/Entities/AccountSecurity.ts
var import_typeorm = require("typeorm");
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
var AccountSecurity = class {
  static {
    __name(this, "AccountSecurity");
  }
  snowflake;
  AccountType;
  AuthorizationLevel;
};
_ts_decorate([
  (0, import_typeorm.PrimaryColumn)(),
  _ts_metadata("design:type", String)
], AccountSecurity.prototype, "snowflake", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: 1
  }),
  _ts_metadata("design:type", Number)
], AccountSecurity.prototype, "AccountType", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: 1
  }),
  _ts_metadata("design:type", Number)
], AccountSecurity.prototype, "AuthorizationLevel", void 0);
AccountSecurity = _ts_decorate([
  (0, import_typeorm.Entity)({
    name: "AccountSecurity"
  })
], AccountSecurity);

// src/Core/Entities/Developer.ts
var import_typeorm2 = require("typeorm");
function _ts_decorate2(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate2, "_ts_decorate");
function _ts_metadata2(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata2, "_ts_metadata");
var Developer = class {
  static {
    __name(this, "Developer");
  }
  snowflake;
  MaintenanceModeStatus;
};
_ts_decorate2([
  (0, import_typeorm2.PrimaryColumn)(),
  _ts_metadata2("design:type", String)
], Developer.prototype, "snowflake", void 0);
_ts_decorate2([
  (0, import_typeorm2.Column)({
    default: false
  }),
  _ts_metadata2("design:type", Boolean)
], Developer.prototype, "MaintenanceModeStatus", void 0);
Developer = _ts_decorate2([
  (0, import_typeorm2.Entity)({
    name: "Developer"
  })
], Developer);

// src/Core/Entities/GuildModerationSetting.ts
var import_typeorm3 = require("typeorm");
function _ts_decorate3(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate3, "_ts_decorate");
function _ts_metadata3(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata3, "_ts_metadata");
var GuildModerationSetting = class {
  static {
    __name(this, "GuildModerationSetting");
  }
  snowflake;
  AppealLink;
  AppealLinkStatus;
  BanDeleteMessagesHistory;
  ModerationConfirmationMessage;
  ModerationPrivateLogChannel;
  ModerationPrivateLogStatus;
  ModerationPublicLogChannel;
  ModerationPublicLogStatus;
  ReportMessageChannel;
  ReportMessageStatus;
  ReportUserChannel;
  ReportUserStatus;
  RequireReason;
  TimeoutTimer;
};
_ts_decorate3([
  (0, import_typeorm3.PrimaryColumn)(),
  _ts_metadata3("design:type", String)
], GuildModerationSetting.prototype, "snowflake", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    nullable: true
  }),
  _ts_metadata3("design:type", String)
], GuildModerationSetting.prototype, "AppealLink", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "AppealLinkStatus", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: 0
  }),
  _ts_metadata3("design:type", Number)
], GuildModerationSetting.prototype, "BanDeleteMessagesHistory", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "ModerationConfirmationMessage", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: "0"
  }),
  _ts_metadata3("design:type", String)
], GuildModerationSetting.prototype, "ModerationPrivateLogChannel", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "ModerationPrivateLogStatus", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: "0"
  }),
  _ts_metadata3("design:type", String)
], GuildModerationSetting.prototype, "ModerationPublicLogChannel", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "ModerationPublicLogStatus", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: "0"
  }),
  _ts_metadata3("design:type", String)
], GuildModerationSetting.prototype, "ReportMessageChannel", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "ReportMessageStatus", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: "0"
  }),
  _ts_metadata3("design:type", String)
], GuildModerationSetting.prototype, "ReportUserChannel", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "ReportUserStatus", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: false
  }),
  _ts_metadata3("design:type", Boolean)
], GuildModerationSetting.prototype, "RequireReason", void 0);
_ts_decorate3([
  (0, import_typeorm3.Column)({
    default: 3600
  }),
  _ts_metadata3("design:type", Number)
], GuildModerationSetting.prototype, "TimeoutTimer", void 0);
GuildModerationSetting = _ts_decorate3([
  (0, import_typeorm3.Entity)({
    name: "GuildModerationSetting"
  })
], GuildModerationSetting);

// src/Core/Entities/GuildRole.ts
var import_typeorm4 = require("typeorm");
function _ts_decorate4(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate4, "_ts_decorate");
function _ts_metadata4(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata4, "_ts_metadata");
var GuildRole = class {
  static {
    __name(this, "GuildRole");
  }
  snowflake;
  StaffTeamGuildBotManager;
  StaffTeamGuildManager;
  StaffTeamGuildOwner;
};
_ts_decorate4([
  (0, import_typeorm4.PrimaryColumn)(),
  _ts_metadata4("design:type", String)
], GuildRole.prototype, "snowflake", void 0);
_ts_decorate4([
  (0, import_typeorm4.Column)({
    default: "0"
  }),
  _ts_metadata4("design:type", String)
], GuildRole.prototype, "StaffTeamGuildBotManager", void 0);
_ts_decorate4([
  (0, import_typeorm4.Column)({
    default: "0"
  }),
  _ts_metadata4("design:type", String)
], GuildRole.prototype, "StaffTeamGuildManager", void 0);
_ts_decorate4([
  (0, import_typeorm4.Column)({
    default: "0"
  }),
  _ts_metadata4("design:type", String)
], GuildRole.prototype, "StaffTeamGuildOwner", void 0);
GuildRole = _ts_decorate4([
  (0, import_typeorm4.Entity)({
    name: "GuildRole"
  })
], GuildRole);

// src/Core/Classes/Database.ts
var Database = new import_typeorm5.DataSource({
  type: "sqlite",
  database: "./storage/database.sqlite",
  entities: [
    AccountSecurity,
    Developer,
    GuildModerationSetting,
    GuildRole
  ],
  logging: false,
  synchronize: true
});

// src/Core/Enums/AccountType.ts
var AccountType;
(function(AccountType2) {
  AccountType2[AccountType2["Unknown"] = 0] = "Unknown";
  AccountType2[AccountType2["Member"] = 1] = "Member";
  AccountType2[AccountType2["Support"] = 2] = "Support";
  AccountType2[AccountType2["Developer"] = 3] = "Developer";
  AccountType2[AccountType2["Owner"] = 4] = "Owner";
  AccountType2[AccountType2["Guild"] = 5] = "Guild";
  AccountType2[AccountType2["PartnerGuild"] = 6] = "PartnerGuild";
  AccountType2[AccountType2["OfficialGuild"] = 7] = "OfficialGuild";
})(AccountType || (AccountType = {}));

// src/Core/Enums/AuthorizationLevel.ts
var AuthorizationLevel;
(function(AuthorizationLevel2) {
  AuthorizationLevel2[AuthorizationLevel2["Unauthorized"] = 0] = "Unauthorized";
  AuthorizationLevel2[AuthorizationLevel2["Authorized"] = 1] = "Authorized";
  AuthorizationLevel2[AuthorizationLevel2["BypassAuthorization"] = 2] = "BypassAuthorization";
})(AuthorizationLevel || (AuthorizationLevel = {}));

// src/Core/Functions/Database/DatabaseConnect.ts
async function DatabaseConnect() {
  if (Database.isInitialized) return;
  await Database.initialize();
  if (!Database.isInitialized) await Database.initialize();
}
__name(DatabaseConnect, "DatabaseConnect");

// src/Core/Functions/Database/FindOrCreateEntity.ts
async function FindOrCreateEntity(entity, criteria) {
  if (!Database.isInitialized) await DatabaseConnect();
  const data2 = await Database.manager.findOne(entity, {
    where: criteria
  });
  if (data2) return data2;
  const new_data = Database.manager.create(entity, criteria);
  await Database.manager.save(new_data);
  return new_data;
}
__name(FindOrCreateEntity, "FindOrCreateEntity");

// src/Core/Classes/Sentry.ts
var Sentry = class {
  static {
    __name(this, "Sentry");
  }
  static async BlossomGuildSettingAuthorization(guild, member) {
    const member_roles = member.roles.cache.map((role) => role.id);
    const guild_role = await FindOrCreateEntity(GuildRole, {
      snowflake: guild.id
    });
    const guild_owner = guild_role.StaffTeamGuildOwner.split(", ");
    const guild_manager = guild_role.StaffTeamGuildManager.split(", ");
    const guild_bot_manager = guild_role.StaffTeamGuildBotManager.split(", ");
    const staff_team_roles = guild_owner.concat(guild_manager, guild_bot_manager);
    return member.id === guild.ownerId || member_roles.some((role) => staff_team_roles.includes(role));
  }
  static async IsAuthorized(snowflake) {
    const account_security = await FindOrCreateEntity(AccountSecurity, {
      snowflake
    });
    return account_security.AuthorizationLevel === AuthorizationLevel.Authorized || account_security.AuthorizationLevel === AuthorizationLevel.BypassAuthorization;
  }
  static async MaintenanceModeStatus(client, snowflake) {
    const developer = await FindOrCreateEntity(Developer, {
      snowflake: client.user.id
    });
    if (!snowflake) return developer.MaintenanceModeStatus;
    const account_security = await FindOrCreateEntity(AccountSecurity, {
      snowflake
    });
    const bypass_authorization = account_security.AuthorizationLevel === AuthorizationLevel.BypassAuthorization ? false : true;
    return !developer.MaintenanceModeStatus ? false : !bypass_authorization;
  }
};

// src/Commands/Management/config.ts
var data = {
  name: "config",
  description: "Configure Blossom for your server",
  type: import_discord.ApplicationCommandType.ChatInput,
  dm_permission: false
};
async function run({ client, handler, interaction }) {
  if (!interaction.inCachedGuild() || !interaction.isChatInputCommand()) return;
  if (await Sentry.MaintenanceModeStatus(client, interaction.user.id) && await Sentry.MaintenanceModeStatus(client, interaction.guild.id)) return void await Blossom.CreateInteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience.");
  if (!await Sentry.IsAuthorized(interaction.guild.id)) return;
  if (!await Sentry.IsAuthorized(interaction.user.id)) return void await Blossom.CreateInteractionError(interaction, `You are unauthorized to use ${client.user.username}.`);
  if (!await Sentry.BlossomGuildSettingAuthorization(interaction.guild, interaction.member)) return void await Blossom.CreateInteractionError(interaction, `</${interaction.commandName}:${interaction.commandId}> is restricted to members of the Management Team in ${interaction.guild.name}.`);
  const embed_one = new import_discord.EmbedBuilder().setDescription(`### ${client.user.username}'s Setting for ${interaction.guild.name}
Select a plugin to edit using the menu below. To control who can view commands, go to **Server Settings** > **Integrations** > **${client.user.username}**.`).setColor(Blossom.DefaultHex());
  const action_row_one = new import_blossom.StringSelectMenuManager().CreateSelectMenu({
    custom_id: "ManagePluginSetting",
    select_options: [
      {
        label: "Moderation",
        value: "Moderation",
        description: "A hub for server appeals, logging, reports, and more.",
        emoji: {
          name: "ModeratorProgramsAlumni",
          id: "1136567803424555128"
        }
      },
      {
        label: "Server Role",
        value: "ServerRole",
        description: "A tool for customizing server roles for specific features.",
        emoji: {
          name: "RoleBadge",
          id: "1198127296607957033"
        }
      },
      {
        label: "Ticket System",
        value: "TicketSystem",
        description: "A tool for managing the server ticket system.",
        emoji: {
          name: "IDCards",
          id: "1198136825693352047"
        }
      }
    ],
    placeholder: "View Plugins"
  }).BuildActionRow();
  const action_row_two = new import_blossom.ButtonManager().CreateRegularButton({
    custom_id: "ExitPluginSetting",
    style: import_discord.ButtonStyle.Secondary,
    label: "Exit"
  }).CreateRegularButton({
    custom_id: "ViewPluginSetting",
    style: import_discord.ButtonStyle.Secondary,
    disabled: true,
    label: "Home"
  }).CreateLinkButton({
    custom_id: "https://github.com/CosmosPortal",
    style: import_discord.ButtonStyle.Link,
    label: "Documentation"
  }).BuildActionRow();
  return void await interaction.reply({
    embeds: [
      embed_one
    ],
    components: [
      action_row_one,
      action_row_two
    ],
    ephemeral: true
  });
}
__name(run, "run");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  data,
  run
});
