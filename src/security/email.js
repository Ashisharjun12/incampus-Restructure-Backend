import arcjet, { validateEmail } from "@arcjet/node";
import { _config } from "../config/config.js";
export const aj = arcjet({
  key: _config.ARCJET_KEY,
  rules: [
    validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});



