require("dotenv").config();

let config = {
  backendHost: process.env.SERVER_NAME || "api.vipfy.store",
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
  config.stripeToken = config.isDevelopment
    ? "pk_test_W9VDDvYKZqcmbgaz7iAcUR9j"
    : "pk_live_OrfeIMTOFjG5o9S5zm9iYH0x";
}

export default config;
