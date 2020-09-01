import * as os from "os";
import { inspect } from "util";

import type ApolloClient from "apollo-client";
import Store from "electron-store";
import gelf from "gelf-pro";
import gql from "graphql-tag";
import { v4 as uuid } from "uuid";

import config from "./configurationManager";

// set up default list of logging levels for typescript
declare module "gelf-pro" {
  function emergency(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function alert(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function critical(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function error(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function warning(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function warn(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function notice(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function info(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function debug(message: Message, extra?: MessageExtra, callback?: MessageCallback);
  function log(message: Message, extra?: MessageExtra, callback?: MessageCallback);
}

// add types for console.* methods that don't natively exist
declare global {
  interface Console {
    emergency(message?: any, ...optionalParams: any[]): void;
    alert(message?: any, ...optionalParams: any[]): void;
    critical(message?: any, ...optionalParams: any[]): void;
  }
}

// used for getting additional metadata if we can
let client: ApolloClient<any> | null = null;
export function setClient(c?: ApolloClient<any>) {
  client = c;
}

gelf.setConfig({
  filter: [
    message => {
      // levels go from 0: emergency to 7: debug
      // don't send messages with level debug
      return message.level < 7;
    }
  ],
  adapterName: "tcp-tls",
  adapterOptions: {
    host: "graylog.internal.vipfy.store",
    port: 12202,
    family: 4
  }
});

// see networkInterface for more info
const store = new Store();
if (!store.has("deviceId")) {
  store.set("deviceId", uuid());
}

gelf.setConfig({
  fields: {
    host_arch: os.arch(),
    process_start_time: process.getCreationTime() / 1000,
    os_platform: os.platform(),
    // os_version: os.version(),
    host_name: os.hostname(),
    host_deviceid: store.get("deviceId", ""),
    session: uuid(), // to make tracking consecutive messages easier
    backend_host: config.backendHost,
    backend_port: config.backendPort
  }, // default fields for all messages
  transform: [
    message => {
      message.host_freemem = os.freemem();
      message.host_totalmem = os.totalmem();
      message.host_memfraction = os.freemem() / os.totalmem();
      message.host_uptime = os.uptime();

      try {
        const { me } = client.readQuery(
          {
            // read from cache
            query: gql`
              {
                me {
                  id
                  isadmin
                  language
                  company {
                    unitid {
                      id
                    }
                    employees
                  }
                }
              }
            `
          },
          true
        );
        message.user_id = me.id;
        message.user_admin = me.isadmin;
        message.user_language = me.language;
        message.user_companyid = me.company.unitid.id;
        message.user_employees = me.company.employees; // number of employees in company
      } catch {} // readQuery always throws if info is not in cache. That means the user isn't logged in
      return message;
    }
  ]
});

function makeLogString(params: any[]): gelf.Message {
  if (params.every(v => ["string", "boolean", "number", "bigint"].includes(typeof v))) {
    // save to join everything similar to console.log
    return params.join(" ");
  } else {
    // it's complicated, so create less pretty but more accurate representation
    return inspect(params, { depth: Infinity });
  }
}

function makeExtraData(params: any[]): gelf.MessageExtra {
  if (!params) return undefined;
  return params.find(v => v instanceof Error);
}

const _error = console.error;
const _warn = console.warn;
const _log = console.log;
const _info = console.info;
const _debug = console.debug;
const _trace = console.trace;

// monkey-patch console.* (at least the ones we use)
// graylog has three log levels above error
/*console.emergency = (...params) => {
  _error(...params);
  gelf.emergency(makeLogString(params), makeExtraData(params));
};
console.alert = (...params) => {
  _error(...params);
  gelf.alert(makeLogString(params), makeExtraData(params));
};
console.critical = (...params) => {
  _error(...params);
  gelf.critical(makeLogString(params), makeExtraData(params));
};
console.error = (...params) => {
  _error(...params);
  gelf.error(makeLogString(params), makeExtraData(params));
};
console.warn = (...params) => {
  _warn(...params);
  gelf.warning(makeLogString(params), makeExtraData(params));
};
console.info = (...params) => {
  _info(...params);
  gelf.notice(makeLogString(params), makeExtraData(params));
};
console.log = (...params) => {
  _log(...params);
  gelf.info(makeLogString(params), makeExtraData(params));
};
console.debug = (...params) => {
  _debug(...params);
  gelf.debug(makeLogString(params), makeExtraData(params));
};
console.trace = (...params) => {
  _trace(...params, new Error().stack);
  gelf.debug(makeLogString(params), makeExtraData(params));
};

console.assert = (assert, ...params) => {
  if (assert) return;
  params.push(new Error("Assertion failed"));
  _warn(...params, new Error().stack);
  gelf.warn(makeLogString(params));
};*/

export const logger = gelf;
