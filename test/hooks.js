// enable requiring stuff from ts(x) files
process.env.TS_NODE_PROJECT = "./tsconfig.json";
require("ts-mocha");
require("chai/register-should");

const gitConfig = require("gitconfig");
const Application = require("spectron").Application;
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const electronPath = require("electron");
const path = require("path");
const sendEmail = require("./helpers/email.js").sendEmail;

const SECOND = 1000;
const APP_LAUNCH_SECONDS = 120 * SECOND;

let userGitEmail;

global.before(() => {
  chai.use(chaiAsPromised);
  setUserGitEmail();
});

beforeEach(async function () {
  this.timeout(APP_LAUNCH_SECONDS);

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

/**
 * Sets the email address of the developer who called the test script. It looks for the
 * address in the developer's computer's global Git configuration.
 */
function setUserGitEmail() {
  const LOCATION = "global";

  gitConfig
    .get({
      location: LOCATION
    })
    .then(config => {
      if (!config || !config.user || !config.user.email) {
        console.warn("No email address found in Git config. Location: " + LOCATION);
      } else {
        userGitEmail = config.user.email;
      }
    })
    .catch(err => {
      console.log(
        "Error while getting developer's email address from Git config. Location: " + LOCATION
      );
      console.warn(err);
    });
}

/**
 * Sends test results in an email report to the developer who called the test script.
 */
async function sendReportByMail(templateId, mailParams, done) {
  try {
    if (!userGitEmail) {
      console.warn("Reports won't be sent.");
      return;
    }

    await sendEmail({
      templateId,
      fromName: "VIPFY",
      personalizations: [
        {
          to: [{ email: userGitEmail }],
          dynamic_template_data: mailParams
        }
      ]
    });
  } finally {
    done();
  }
}

module.exports = { sendReportByMail, APP_LAUNCH_SECONDS };
