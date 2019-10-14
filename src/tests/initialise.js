const path = require("path");
const { Application } = require("spectron");

module.exports = {
  initialiseSpectron: () => {
    let electronPath = path.join(__dirname, "../../node_modules", ".bin", "electron");

    if (process.platform == "win32") {
      electronPath += ".cmd";
    }

    return new Application({
      path: electronPath,
      args: [path.join(__dirname, "../index.ts"), path.join(__dirname, "../../package.json")],
      env: {
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
        NODE_ENV: "development"
      },
      startTimeout: 10000,
      chromeDriverLogPath: "../chromedriverlog.txt"
    });
  },
  sleep: time => new Promise(resolve => setTimeout(resolve, time))
};
