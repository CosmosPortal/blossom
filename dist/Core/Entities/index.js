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

// src/Core/Entities/index.ts
var Entities_exports = {};
__export(Entities_exports, {
  AccountSecurity: () => AccountSecurity,
  Developer: () => Developer,
  GuildModerationSetting: () => GuildModerationSetting,
  GuildRole: () => GuildRole
});
module.exports = __toCommonJS(Entities_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountSecurity,
  Developer,
  GuildModerationSetting,
  GuildRole
});
