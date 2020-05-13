const fs = require("fs");
const path = require("path");
const SsoTestPage = require("./pageObject/sso-test.page");
const sendReportByMail = require("./hooks.js").sendReportByMail;
const objectStorage = require("./helpers/objectStorage.js");
const tests = require("../src/react/components/admin/UniversalLoginTest/tests.tsx").tests;
const sites = require("../src/react/components/admin/UniversalLoginTest/sites.tsx").sites;

const RESULT_FILE_PATH = "./ssotest.json";
const RESULT_FILE_MIME_TYPE = "application/json";
const RESULT_FILE_ENCODING = "utf8";
const S3_BUCKET_NAME = "vipfy-ssotests";
const SECOND = 1000;
const appStartTimeout = 20 * SECOND;
const batchRunTimeout = sites.length * tests.length * 15 * SECOND;

let sitesPassedImportantTests = false;
let statistics = "";
let link = "";

describe("SSO Execution", function () {
  this.timeout(appStartTimeout + batchRunTimeout);

  before(function (done) {
    fs.existsSync(RESULT_FILE_PATH) && fs.unlinkSync(RESULT_FILE_PATH);
    done();
  });

  it("should apply SSO execution to all apps in list @slow", async function () {
    fs.existsSync(RESULT_FILE_PATH).should.be.false;

    const app = this.test.app;

    await app.client
      .waitUntilWindowLoaded()
      .url(SsoTestPage.url) // go to SSO test page
      // hit button to start a batch run (this replaces the start btn with a pause btn)
      .click(SsoTestPage.startBatchRunIcon)
      // finally wait for the start button to reappear after the batch run has finished
      .waitForVisible(SsoTestPage.startBatchRunIcon, batchRunTimeout);

    statistics = await app.client.elements(SsoTestPage.statisticsTableRow).getText();

    fs.existsSync(RESULT_FILE_PATH).should.be.true;
    await uploadResultFile();

    const sites = JSON.parse(fs.readFileSync(RESULT_FILE_PATH, { encoding: RESULT_FILE_ENCODING }));

    should.exist(sites);
    sites.should.be.an("array");

    // the results file should contain a result for each site
    app.client
      .elements(SsoTestPage.sitesTableRow)
      .should.eventually.have.property("length")
      .and.equal(sites.length);

    // the results file should show that each site passed the important tests
    sitesPassedImportantTests = sites && sites.every(importantTestsPassed);
    sitesPassedImportantTests.should.be.true;
  });
});

after(function (done) {
  const result = sitesPassedImportantTests ? "PASSED" : "FAILED";
  const mailParams = { result, statistics, link };

  console.log(mailParams);
  sendReportByMail(mailParams, done);
});

/** upload the result file to object storage and remember download link */
async function uploadResultFile() {
  const timestamp = Math.trunc(fs.statSync(RESULT_FILE_PATH).mtimeMs / SECOND);
  const fileName = timestamp + "_" + path.basename(RESULT_FILE_PATH);
  await objectStorage.upload(RESULT_FILE_PATH, fileName, RESULT_FILE_MIME_TYPE, S3_BUCKET_NAME);

  link = await objectStorage.getDownloadUrl(fileName, S3_BUCKET_NAME);
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
    site.testResults[2].passed
  );
}
