require("dotenv").config();

let config = {
  backendHost: "api.vipfy.store",
  backendPort: 443,
  backendSSL: true,
  isDevelopment: false,
  stripeToken: process.env.stripeToken,

  showProfile: true,
  showMessageCenter: false,
  showBilling: false,
  showTeams: false,
  showDomains: false,
  showMarketplace: false,
  showAppAdmin: false,
  showAdmin: false,
  showSsoConfig: false,
  showUniversalLoginDebug: false,

  allowDevTools: false
};

if (!config.stripeToken) {
  config.stripeToken = config.isDevelopment
    ? "pk_test_W9VDDvYKZqcmbgaz7iAcUR9j"
    : "pk_live_OrfeIMTOFjG5o9S5zm9iYH0x";
}

export default config;
