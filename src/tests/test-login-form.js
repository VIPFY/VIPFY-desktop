// const chaiAsPromised = require("chai-as-promised");
// const chai = require("chai");
// chai.should();
// chai.use(chaiAsPromised);

// const testHelper = require("./initialise");
// const app = testHelper.initialiseSpectron();

// // Setup Promises and start Application
// before(async () => {
//   await app.start();
//   return testHelper.sleep(10000);
// });

// // Tear down App after Tests are finished
// after(() => {
//   console.log(app);
//   if (app && app.isRunning()) {
//     return app.stop();
//   }
// });

// describe("Login", () => {
//   it("opens a window", async function() {
//     await app.client.waitUntilWindowLoaded();
//     return (await app.client.getWindowCount()).should.equal(1);
//   });

//   // it("tests the title", () =>
//   //   app.client
//   //     .waitUntilWindowLoaded()
//   //     .getTitle()
//   //     .should.eventually.equal("VIPFY"));
// });

const { Application } = require("spectron");
const assert = require("assert");
const path = require("path");

describe("Application launch", function() {
  this.timeout(10000);

  beforeEach(async function() {
    this.app = new Application({
      path: path.join(__dirname, "../../node_modules", ".bin", "electron"),
      args: [path.join(__dirname, "..")],
      chromeDriverArgs: ["remote-debugging-port=9222"]
    });
    console.log("abc");
    await this.app.start();
    console.log("abcd");
    return Promise.resolve();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      // TODO: figure out way to close all windows
      return this.app.electron.app.quit();
    }
  });

  it("shows an initial window", function() {
    return this.app.client.getWindowCount().then(function(count) {
      //assert.equal(count, 1)
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      assert.equal(count, 2);
    });
  });
});

// const { Application } = require("spectron");
// const assert = require("assert");
// const path = require("path");

// describe("VIPFY launches", function() {
//   this.timeout(10000);

//   beforeEach(() => {
//     this.app = new Application({
//       path: path.join(__dirname, "../../node_modules", ".bin", "electron"),
//       args: [path.join(__dirname, "../index.ts"), path.join(__dirname, "../../package.json")]
//     });

//     return this.app.start();
//   });

//   afterEach(() => {
//     if (this.app && this.app.isRunning()) {
//       return this.app.stop();
//     }
//   });

//   it("shows an initial window", () =>
//     this.app.client.getWindowCount().then(count => assert.equal(count, 2)));
// });
