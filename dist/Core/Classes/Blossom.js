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

// src/Core/Classes/Blossom.ts
var Blossom_exports = {};
__export(Blossom_exports, {
  Blossom: () => Blossom
});
module.exports = __toCommonJS(Blossom_exports);
var Blossom = class {
  static {
    __name(this, "Blossom");
  }
  static CreateErrorEmbed(message, error_color = 16758725) {
    const data = {
      description: message,
      color: error_color
    };
    return data;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Blossom
});
