const fs = require("fs");
const path = require("path");
const SsoTestPage = require("./pageObject/sso-test.page");
const sendReportByMail = require("./hooks.js").sendReportByMail;
const objectStorage = require("./helpers/objectStorage.js");
const tests = require("../src/react/components/admin/UniversalLoginTest/tests.tsx").tests;
const sites = require("../src/react/components/admin/UniversalLoginTest/sites.tsx").sites;

const RESULTS_FILE_PATH = "ssotest.json";
const S3_BUCKET_NAME = "vipfy-ssotests";
const SECOND = 1000;
const appStartTimeout = 20 * SECOND;
const batchRunTimeout = sites.length * tests.length * 15 * SECOND;

let sitesPassedImportantTests = false;
let statistics = "";
let link = "";

describe("SSO Execution", function () {
  this.timeout(appStartTimeout + batchRunTimeout);

  it("should apply SSO execution to all apps in list @slow", async function () {
    const app = this.test.app;
    const initialFileChangeTimestamp = getChangeTimestamp();

    await app.client
      .waitUntilWindowLoaded()
      .url(SsoTestPage.url) // go to SSO test page
      // hit button to start a batch run (this replaces the start btn with a pause btn)
      .click(SsoTestPage.startBatchRunIcon)
      // finally wait for the start button to reappear after the batch run has finished
      .waitForVisible(SsoTestPage.startBatchRunIcon, batchRunTimeout);

    statistics = await app.client.elements(SsoTestPage.statisticsTableRow).getText();

    fs.existsSync(RESULTS_FILE_PATH).should.be.true;

    const sites = JSON.parse(fs.readFileSync(RESULTS_FILE_PATH, { encoding: "utf8" }));
    const fileChangeTimestamp = getChangeTimestamp();

    should.exist(sites);
    sites.should.be.an("array");

    // the results file should have been updated after starting this test
    fileChangeTimestamp.should.be.greaterThan(initialFileChangeTimestamp);

    // the results file should contain a result for each site
    app.client
      .elements(SsoTestPage.sitesTableRow)
      .should.eventually.have.property("length")
      .and.equal(sites.length);

    // the results file should show that each site passed the important tests
    sitesPassedImportantTests = sites && sites.every(importantTestsPassed);
    sitesPassedImportantTests.should.be.true;

    // upload the result file to object storage
    const fileName = fileChangeTimestamp + "_" + path.basename(RESULTS_FILE_PATH);
    await objectStorage.upload(fileName, S3_BUCKET_NAME);
    link = await objectStorage.getDownloadUrl(fileName, S3_BUCKET_NAME);
    console.log(link);
  });
});

after(function (done) {
  const result = sitesPassedImportantTests ? "PASSED" : "FAILED";
  const mailParams = { result, statistics, link };

  console.log(mailParams);
  sendReportByMail(mailParams, done);
});

function getChangeTimestamp() {
  if (!fs.existsSync(RESULTS_FILE_PATH)) {
    return 0;
  }

  return Math.trunc(fs.statSync(RESULTS_FILE_PATH).mtimeMs / SECOND);
}

// it was agreed that only the tests with correct login credentials or a
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
