import { createLogger, format, transports } from "winston";

const isProduction = () => process.env.NODE_ENV === "production";

export default createLogger({
  format: isProduction() ? format.json() : format.cli(),
  transports: [
    new transports.Console({ level: isProduction() ? "info" : "debug" }),
    new transports.File({ filename: "debug.log", level: "debug" }),
  ],
});
