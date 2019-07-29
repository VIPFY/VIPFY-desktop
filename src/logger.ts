import { configure, getLogger } from "log4js";
import config from "./configurationManager";

let activeAppenders = [];
if (config.isDevelopment) {
  activeAppenders.push("stdout");
}
if (config.isDevelopment || config.allowDevTools) {
  activeAppenders.push("console");
}

configure({
  appenders: {
    file: {
      type: "file",
      filename: "debug.log",
      maxLogSize: 10 * 1024 * 1024,
      backups: 3,
      keepFileExt: true
    },
    console: { type: "console", layout: { type: "messagePassThrough" } },
    stdout: { type: "stdout", layout: { type: "coloured" } }
  },
  categories: { default: { appenders: activeAppenders, level: "debug", enableCallStack: true } }
});

export const logger = getLogger("vipfy");
export const resetLoggingContext = () => {
  logger.clearContext();
};

const consoleLogger = getLogger("vipfy.console");
console.trace = consoleLogger.trace.bind(consoleLogger);
console.debug = consoleLogger.debug.bind(consoleLogger);
console.log = consoleLogger.debug.bind(consoleLogger);
console.info = consoleLogger.info.bind(consoleLogger);
console.warn = consoleLogger.warn.bind(consoleLogger);
console.error = consoleLogger.error.bind(consoleLogger);
