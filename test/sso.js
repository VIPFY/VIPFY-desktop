const fs = require("fs");
const hooks = require("./hooks");
const SsoTestPage = require("./pageObject/sso-test.page");
const sendEmail = require("./helpers/email.js").sendEmail;
const tests = require("../src/react/components/admin/UniversalLoginTest/tests.tsx").tests;
const sites = require("../src/react/components/admin/UniversalLoginTest/sites.tsx").sites;

const RESULTS_FILE_PATH = "ssotest.json";
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
      .should.eventually.be.above(0)
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

  // we agreed that only the tests with correct login credentials or a
  // pre-existing session are critical at the moment. the tests where an
  // error is expected upon entering wrong credentials aren't taken into
  // account here. if the order of the tests gets changed, this
  // function needs to be changed accordingly.
  function importantTestsPassed(site) {
    return (
      site.testResults &&
      (site.testResults[0].passed || site.testResults[1].passed) &&
      site.testResults[3].passed
    );
  }

  it("applies SSO to all apps in list. Slow.", async function () {
    const startTime = Date.now();

    // start app
    await loadWindow()
      // go to SSO test page
      .url(SsoTestPage.url)
      // hit button to start a batch run (this removes the button...)
      .click(SsoTestPage.startBatchRunIcon)
      // wait for the start button to reappear after the batch run has finished
      .waitForVisible(SsoTestPage.startBatchRunIcon, batchRunTimeout);

    const sites = JSON.parse(fs.readFileSync(RESULTS_FILE_PATH, { encoding: "utf8" }));

    // the results file should have been updated after starting this test
    const lastFileModificationTime = fs.statSync(RESULTS_FILE_PATH).mtimeMs;
    lastFileModificationTime.should.be.greaterThan(startTime);

    // the results file should contain a result for each site
    should.exist(sites);
    sites.should.be.an("array");
    app.client
      .elements(SsoTestPage.sitesTableRow)
      .should.eventually.have.property("length")
      .and.equal(sites.length);

    // the results file should show that each site passed the important tests
    sitesPassedImportantTests = sites && sites.every(importantTestsPassed);
    sitesPassedImportantTests.should.be.true;

    const result = sitesPassedImportantTests ? "PASSED" : "FAILED";
    const statistics = await app.client.elements(SsoTestPage.statisticsTableRow).getText();

    await sendEmail({
      templateId: "d-0bc1db6347c840729375e85e5682ae6d",
      fromName: "VIPFY",
      personalizations: [
        {
          to: [{ email: "eva.kiszka@vipfy.store" }],
          dynamic_template_data: { result, statistics }
        }
      ]
    });

    return true;
  });
});
