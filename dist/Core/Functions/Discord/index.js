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

// src/Core/Functions/Discord/index.ts
var Discord_exports = {};
__export(Discord_exports, {
  FormatTimeout: () => FormatTimeout
});
module.exports = __toCommonJS(Discord_exports);

// src/Core/Functions/Discord/FormatTimeout.ts
function FormatTimeout(seconds, separator = ",") {
  const times = [
    {
      unit: "Week",
      seconds: 604800
    },
    {
      unit: "Day",
      seconds: 86400
    },
    {
      unit: "Hour",
      seconds: 3600
    },
    {
      unit: "Minute",
      seconds: 60
    },
    {
      unit: "Second",
      seconds: 1
    }
  ];
  let timeout_unit = [];
  for (const { unit, seconds: unit_seconds } of times) {
    if (seconds >= unit_seconds) {
      const unitValue = Math.floor(seconds / unit_seconds);
      timeout_unit.push(`${unitValue} ${unit}${unitValue !== 1 ? "s" : ""}`);
      seconds %= unit_seconds;
    }
  }
  return timeout_unit.join(separator);
}
__name(FormatTimeout, "FormatTimeout");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FormatTimeout
});
