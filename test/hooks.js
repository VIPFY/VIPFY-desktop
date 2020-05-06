// enable requiring stuff from ts(x) files
process.env.TS_NODE_PROJECT = "./tsconfig.json";
require("chai/register-should");
require("ts-mocha");

const Application = require("spectron").Application;
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const electronPath = require("electron");
const path = require("path");

global.before(() => {
  chai.use(chaiAsPromised);
});

module.exports = {
  async startApp() {
    const app = await new Application({
      path: electronPath,
      args: [path.join(__dirname, "..")],
      webdriverOptions: { deprecationWarnings: false }
    }).start();

    chaiAsPromised.transferPromiseness = app.transferPromiseness;

    return app;
  },

  async stop(app) {
    if (app && app.isRunning()) {
      await app.stop();
    }
  }
};
