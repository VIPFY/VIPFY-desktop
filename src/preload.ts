{
  // tslint:disable:no-var-requires
  const con = require("electron").remote.getGlobal("console");
  let ipcRenderer = require("electron").ipcRenderer;
  const hostname = window.location.hostname;
  function hostMatches(domain: string) {
    return new RegExp(domain).test(hostname);
  }

  let interactionHappened = false;
  function didInteraction() {
    interactionHappened = true;
  }
  function timer() {
    if (!interactionHappened) {
      return;
    }
    interactionHappened = false;
    ipcRenderer.sendToHost("interactionHappened");
  }

  document.addEventListener("mousemove", didInteraction, true);
  document.addEventListener("touchmove", didInteraction, true);
  document.addEventListener("touchenter", didInteraction, true);
  document.addEventListener("pointermove", didInteraction, true);
  document.addEventListener("keydown", didInteraction, true);
  document.addEventListener("scroll", didInteraction, true);

  setInterval(() => timer(), 30000);
  setTimeout(() => timer(), 5000);

  try {
    if (hostMatches("(www.)?vipfy.com")) {
      require("./locationScripts/vipfy.ts")();
    } else if (hostMatches("(www.)?dropbox.com")) {
      require("./locationScripts/dropbox.ts")();
    } else if (hostMatches(".*.?pipedrive.com")) {
      require("./locationScripts/pipedrive.ts")();
    } else if (hostMatches(".*.?wrike.com")) {
      require("./locationScripts/wrike.ts")();
    } else if (hostMatches(".*.?google.com")) {
      require("./locationScripts/googledocs.ts")();
    } else if (hostMatches(".*.?weebly(cloud?).com")) {
      require("./locationScripts/weebly.ts")();
    } else if (hostMatches(".*.?moo.com")) {
      require("./locationScripts/moo.ts")();
    } else if (hostMatches(".*.?domaindiscount24.com")) {
      require("./locationScripts/dd24.ts")();
    } else if (hostMatches(".*.?sendgrid.com")) {
      require("./locationScripts/sendgrid.ts")();
    } else if (hostMatches(".*.?freshbooks.com")) {
      require("./locationScripts/freshbooks.ts")();
    } else if (hostMatches(".*.?vistaprint.com")) {
      require("./locationScripts/vistaprint.ts")();
    } else if (hostMatches(".*.?salesforce.com")) {
      require("./locationScripts/salesforce.ts")();
    } else if (hostMatches(".*.?webex.com")) {
      require("./locationScripts/webex.ts")();
    } else if (hostMatches(".*.?zendesk.com")) {
      require("./locationScripts/support.ts")();
    } else if (hostMatches(".*.?meraki.com")) {
      require("./locationScripts/meraki.ts")();
    } else if (hostMatches(".*.?docusign.com")) {
      require("./locationScripts/docusign.ts")();
    } else if (hostMatches(".*.?amazon.com")) {
      require("./locationScripts/aws.ts")();
    } else if (hostMatches(".*.?qbo.intuit.com")) {
      require("./locationScripts/quickbooks.ts")();
    } else if (hostMatches(".*.?slack.com")) {
      require("./locationScripts/slack.ts")();
    } else if (hostMatches(".*.?realtimeboard.com")) {
      require("./locationScripts/realtimeboard.ts")();
    } else {
      con.log(`No Script for ${hostname}`);
    }
    con.log(`Executed Script for ${hostname}`);
  } catch (e) {
    con.log(e.stack);
    con.log(`Executed Script for ${hostname}`);
  }
}
