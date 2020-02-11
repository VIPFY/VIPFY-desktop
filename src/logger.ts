import log4js from "log4js";
import * as logstashudp from "@log4js-node/logstashudp";
import config from "./configurationManager";
import * as os from "os";
import * as is from "electron-is";

const { configure, getLogger } = log4js;
let activeAppenders = ["logstash_filtered"];

if (config.isDevelopment) {
  activeAppenders.push("stdout");
}

if (config.isDevelopment || config.allowDevTools) {
  activeAppenders.push("console");
}

configure({
  appenders: {
    // file: {
    //   type: "file",
    //   filename: app.getPath("userData") + "/debug.log",
    //   maxLogSize: 10 * 1024 * 1024,
    //   backups: 3,
    //   keepFileExt: true
    // },
    console: { type: "console", layout: { type: "messagePassThrough" } },
    stdout: { type: "stdout", layout: { type: "coloured" } },
    logstash: {
      type: logstashudp,
      host: "clientlogs.vipfy.store",
      port: 80
    },
    logstash_filtered: { type: "logLevelFilter", appender: "logstash", level: "info" }
  },
  categories: { default: { appenders: activeAppenders, level: "trace", enableCallStack: true } }
});

export const logger = getLogger("vipfy");
export const resetLoggingContext = () => {
  logger.clearContext();
  consoleLogger.clearContext();
  addToLoggerContext("process_start_time", new Date(process.getCreationTime()));
  addToLoggerContext("host_arch", os.arch());
  addToLoggerContext("freemem", os.freemem());
  addToLoggerContext("totalmem", os.totalmem());
  addToLoggerContext("os_platform", os.platform());
  addToLoggerContext("os_version", os.release());
  addToLoggerContext("host_uptime", os.uptime());
};

const consoleLogger = getLogger("vipfy.console");
console.trace = consoleLogger.trace.bind(consoleLogger);
console.debug = consoleLogger.debug.bind(consoleLogger);
console.log = consoleLogger.debug.bind(consoleLogger);
console.info = consoleLogger.info.bind(consoleLogger);
console.warn = consoleLogger.warn.bind(consoleLogger);
console.error = consoleLogger.error.bind(consoleLogger);

export const addToLoggerContext = (key: string, value: any) => {
  consoleLogger.addContext(key, value);
  logger.addContext(key, value);
};

addToLoggerContext("process_start_time", new Date(process.getCreationTime()));
addToLoggerContext("host_arch", os.arch());
addToLoggerContext("freemem", os.freemem());
addToLoggerContext("totalmem", os.totalmem());
addToLoggerContext("os_platform", os.platform());
addToLoggerContext("os_version", os.release());
addToLoggerContext("host_uptime", os.uptime());

if (is.renderer()) {
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    logger.error(error);
  };
}
