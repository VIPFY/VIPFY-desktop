require("dotenv").config();
import configJSON from "../config.json";

let config = {
  backendHost: process.env.SERVER_NAME || configJSON.server,
  backendPort: process.env.SERVER_PORT || 443,
  backendSSL:
    process.env.SERVER_SSL !== "0" &&
    process.env.SERVER_SSL !== "false" &&
    process.env.SERVER_SSL !== "FALSE",
  isDevelopment: !!process.env.DEVELOPMENT,
  stripeToken: process.env.stripeToken,
  showProfile: true,
  showMessageCenter: false,
  showBilling: true,
  showTeams: false,
  showDomains: false,
  showMarketplace: false,
  showAppAdmin: false,
  showAdmin: true,
  showSsoConfig: false,
  showUniversalLoginDebug: false,
  showVacationRequests: !!process.env.DEVELOPMENT,
  allowDevTools: !!process.env.DEVELOPMENT
};

if (!config.stripeToken) {
  config.stripeToken = configJSON.stripe[config.isDevelopment ? "live" : "dev"];
}

export default config;
