require("dotenv").config();

let config = {
  backendHost: process.env.SERVER_NAME || "api.dev.vipfy.store",
  backendPort: process.env.SERVER_PORT || 443,
  backendSSL: true,
  isDevelopment: !!process.env.DEVELOPMENT,
  stripeToken: process.env.stripeToken,

  showProfile: true,
  showMessageCenter: false,
  showBilling: false,
  showTeams: false,
  showDomains: false,
  showMarketplace: false,
  showAppAdmin: false,
  showAdmin: true,
  showSsoConfig: false,
  showUniversalLoginDebug: false,

  allowDevTools: true
};

if (!config.stripeToken) {
  config.stripeToken = config.isDevelopment
    ? "pk_test_W9VDDvYKZqcmbgaz7iAcUR9j"
    : "pk_live_OrfeIMTOFjG5o9S5zm9iYH0x";
}

export default config;
