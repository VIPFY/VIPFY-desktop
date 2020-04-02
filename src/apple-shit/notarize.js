const { notarize } = require("electron-notarize");
const path = require("path");

module.exports = () => {
  if (process.platform !== "darwin") {
    console.log("Not a Mac; skipping notarization");
    return;
  }

  console.log("Notarizing...");

  return notarize({
    appBundleId: "vipfy-app",
    appPath: path.join(`${__dirname}/../../out/VIPFY-darwin-x64/VIPFY.app`),
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_PASSWORD
  }).catch(e => {
    console.error(e);
    throw e;
  });
};
