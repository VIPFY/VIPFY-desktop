require("dotenv").config();
import configJSON from "../config.json";

const devCheck = !!process.env.DEVELOPMENT || configJSON.development;

let config = {
  backendHost: "api.vipfy.store",
  backendPort: process.env.SERVER_PORT || configJSON.serverPort,
  backendSSL: process.env.hasOwnProperty("SERVER_SSL")
    ? process.env.SERVER_SSL !== "0" &&
      process.env.SERVER_SSL !== "false" &&
      process.env.SERVER_SSL !== "FALSE"
    : configJSON.serverSSL,
  websocketServer: process.env.WEBSOCKET_SERVER || configJSON.websocketServer,
  isDevelopment: devCheck,
  stripeToken: process.env.stripeToken,
  showProfile: true,
  showMessageCenter: false,
  showBilling: true,
  showTeams: false,
  showDomains: false,
  showMarketplace: false,
  showAppAdmin: false,
  showAdmin: devCheck,
  showSsoConfig: false,
  showUniversalLoginDebug: false,
  showVacationRequests: devCheck,
  allowDevTools: devCheck
};

if (!config.stripeToken) {
  config.stripeToken = configJSON.stripe[config.isDevelopment ? "dev" : "live"];
}

export default config;
