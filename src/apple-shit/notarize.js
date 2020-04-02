const { notarize } = require("electron-notarize");
const fs = require("fs");
const path = require("path");

module.exports = () => {
  if (process.platform !== "darwin") {
    console.log("Not a Mac; skipping notarization");
    return;
  }
  // Path from here to the build app executable:
  const fullPath = path.join(__dirname + "/.." + "/.." + "/package.json");
  const package = fs.readFileSync(fullPath);
  const pathToVersion = path.join(
    __dirname + "/.." + "/.." + "/make/" + JSON.parse(package).version
  );
  console.log("The path to the current version is: ", pathToVersion);
  console.log("Notarizing...");

  return notarize({
    appBundleId: "vipfy.desktop.app",
    appPath: pathToVersion,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_PASSWORD
  }).catch(e => {
    console.error(e);
    throw e;
  });
};