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

// src/Core/Entities/GuildModerationSetting.ts
var GuildModerationSetting_exports = {};
__export(GuildModerationSetting_exports, {
  GuildModerationSetting: () => GuildModerationSetting
});
module.exports = __toCommonJS(GuildModerationSetting_exports);
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
_ts_decorate([
  (0, import_typeorm.PrimaryColumn)(),
  _ts_metadata("design:type", String)
], GuildModerationSetting.prototype, "snowflake", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    nullable: true
  }),
  _ts_metadata("design:type", String)
], GuildModerationSetting.prototype, "AppealLink", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "AppealLinkStatus", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: 0
  }),
  _ts_metadata("design:type", Number)
], GuildModerationSetting.prototype, "BanDeleteMessagesHistory", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "ModerationConfirmationMessage", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: "0"
  }),
  _ts_metadata("design:type", String)
], GuildModerationSetting.prototype, "ModerationPrivateLogChannel", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "ModerationPrivateLogStatus", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: "0"
  }),
  _ts_metadata("design:type", String)
], GuildModerationSetting.prototype, "ModerationPublicLogChannel", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "ModerationPublicLogStatus", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: "0"
  }),
  _ts_metadata("design:type", String)
], GuildModerationSetting.prototype, "ReportMessageChannel", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "ReportMessageStatus", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: "0"
  }),
  _ts_metadata("design:type", String)
], GuildModerationSetting.prototype, "ReportUserChannel", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "ReportUserStatus", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: false
  }),
  _ts_metadata("design:type", Boolean)
], GuildModerationSetting.prototype, "RequireReason", void 0);
_ts_decorate([
  (0, import_typeorm.Column)({
    default: 3600
  }),
  _ts_metadata("design:type", Number)
], GuildModerationSetting.prototype, "TimeoutTimer", void 0);
GuildModerationSetting = _ts_decorate([
  (0, import_typeorm.Entity)({
    name: "GuildModerationSetting"
  })
], GuildModerationSetting);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GuildModerationSetting
});
