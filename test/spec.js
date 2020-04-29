const Application = require("spectron").Application;
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const electronPath = require("electron");
const path = require("path");

chai.should();
chai.use(chaiAsPromised);

const app = new Application({
  path: electronPath,
  args: [path.join(__dirname, "..")],
  webdriverOptions: { deprecationWarnings: false }
});

async function loadWindow() {
  await app.client.waitUntilWindowLoaded();
}

describe("Application launch", function () {
  this.timeout(30000);

  beforeEach(async function () {
    chaiAsPromised.transferPromiseness = app.transferPromiseness;

    return app.start();
  });

  afterEach(async function () {
    if (app && app.isRunning()) {
      //return app.stop();
    }
  });

  it("executes an sso login to all apps in list. slow.", async function () {
    await loadWindow();
    console.log("windows loaded");
    await app.client.url("http://localhost:3000/main_window#/universal-login-test");
    console.log("testsite loaded");
    await app.client.click("#startBatchRunIcon");
    console.log("run-button clicked");

    return true;
  });
});
