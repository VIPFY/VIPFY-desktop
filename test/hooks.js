// enable requiring stuff from ts(x) files
process.env.TS_NODE_PROJECT = "./tsconfig.json";
require("ts-mocha");
require("chai/register-should");

const Application = require("spectron").Application;
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const electronPath = require("electron");
const path = require("path");
const sendEmail = require("./helpers/email.js").sendEmail;

const SECOND = 1000;
const APP_LAUNCH_TIME = 20 * SECOND;

exports.sendReportByMail = sendReportByMail;

global.before(() => {
  chai.use(chaiAsPromised);
});

beforeEach(async function () {
  this.timeout(APP_LAUNCH_TIME);

  const app = await new Application({
    path: electronPath,
    args: [path.join(__dirname, "..")],
    webdriverOptions: { deprecationWarnings: false }
  }).start();

  chaiAsPromised.transferPromiseness = app.transferPromiseness;

  this.currentTest.app = app;
});

afterEach(async function () {
  const app = this.currentTest.app;

  if (app && app.isRunning()) {
    await app.stop();
  }
});

async function sendReportByMail(mailParams, done) {
  await sendEmail({
    templateId: "d-0bc1db6347c840729375e85e5682ae6d",
    fromName: "VIPFY",
    personalizations: [
      {
        to: [{ email: "eva.kiszka@vipfy.store" }],
        dynamic_template_data: mailParams
      }
    ]
  });

  done();
}
