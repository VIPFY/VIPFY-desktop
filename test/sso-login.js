const hooks = require("./hooks");
const SsoLoginPage = require("./pageObject/sso-login.page");
const sendEmail = require("./helpers/email.js").sendEmail;
const tests = require("../src/react/components/admin/UniversalLoginTest/tests.tsx").tests;
const sites = require("../src/react/components/admin/UniversalLoginTest/sites.tsx").sites;

const SECOND = 1000;
const appStartTimeout = 20 * SECOND;
const batchRunTimeout = sites.length * tests.length * 15 * SECOND;

describe("Application launch", function () {
  this.timeout(appStartTimeout + batchRunTimeout);
  let app;

  beforeEach(async function () {
    app = await hooks.startApp();
  });

  afterEach(async function () {
    await hooks.stop(app);
  });

  function loadWindow() {
    return app.client
      .waitUntilWindowLoaded()
      .browserWindow.focus()
      .getWindowCount()
      .should.eventually.above(0)
      .browserWindow.isMinimized()
      .should.eventually.be.false.browserWindow.isVisible()
      .should.eventually.be.true.browserWindow.isFocused()
      .should.eventually.be.true.browserWindow.getBounds()
      .should.eventually.have.property("width")
      .and.be.above(0)
      .browserWindow.getBounds()
      .should.eventually.have.property("height")
      .and.be.above(0);
  }

  it("executes an sso login to all apps in list. slow.", async function () {
    await loadWindow()
      .url(SsoLoginPage.url)
      .click(SsoLoginPage.startBatchRunIcon)
      .waitForVisible(SsoLoginPage.startBatchRunIcon, batchRunTimeout);

    await sendEmail({
      templateId: "d-0bc1db6347c840729375e85e5682ae6d",
      fromName: "VIPFY",
      personalizations: [
        {
          to: [{ email: "eva.kiszka@vipfy.store" }],
          dynamic_template_data: { result: "passed" }
        }
      ]
    });

    return true;
  });
});
