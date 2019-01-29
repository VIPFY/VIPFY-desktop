import { type } from "os";

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

  window.addEventListener("load", function() {
    getLoginDetails(0);
  });

  setInterval(() => timer(), 30000);
  setTimeout(() => timer(), 5000);

  //getLoginDetails();

  try {
    if (hostMatches("(www.)?vipfy.com")) {
      require("./locationScripts/vipfy.ts")();
      //} else if (hostMatches("(www.)?dropbox.com")) {
      //  require("./locationScripts/dropbox.ts")();
      //} else if (hostMatches(".*.?pipedrive.com")) {  //Nachschauen woran es liegt
      //  require("./locationScripts/pipedrive.ts")();
      //} else if (hostMatches(".*.?wrike.com")) {
      //  require("./locationScripts/wrike.ts")();
    } else if (hostMatches(".*.?google.com")) {
      require("./locationScripts/googledocs.ts")();
    } else if (hostMatches(".*.?weebly(cloud?).com")) {
      require("./locationScripts/weebly.ts")();
      //} else if (hostMatches(".*.?moo.com")) {
      //  require("./locationScripts/moo.ts")();
    } else if (hostMatches(".*.?domaindiscount24.com")) {
      require("./locationScripts/dd24.ts")();
      //} else if (hostMatches(".*.?sendgrid.com")) {
      //  require("./locationScripts/sendgrid.ts")();
      //} else if (hostMatches(".*.?freshbooks.com")) {
      //  require("./locationScripts/freshbooks.ts")();
      //} else if (hostMatches(".*.?vistaprint.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/vistaprint.ts")();
      //} else if (hostMatches(".*.?salesforce.com")) {
      //  require("./locationScripts/salesforce.ts")();
    } else if (hostMatches(".*.?webex.com")) {
      require("./locationScripts/webex.ts")();
    } else if (hostMatches(".*.?zendesk.com")) {
      require("./locationScripts/support.ts")();
      //} else if (hostMatches(".*.?meraki.com")) {
      //  require("./locationScripts/meraki.ts")();
      //} else if (hostMatches(".*.?docusign.com")) {
      //  require("./locationScripts/docusign.ts")();
      //} else if (hostMatches(".*.?amazon.com")) {     //NEED TO DO DB WORK
      ///  require("./locationScripts/aws.ts")();
      //} else if (hostMatches(".*.?qbo.intuit.com")) {   //NEED TO DO DB WORK
      //  require("./locationScripts/quickbooks.ts")();
      //} else if (hostMatches(".*.?slack.com")) {
      //  require("./locationScripts/slack.ts")();
      //} else if (hostMatches(".*.?realtimeboard.com")) {
      //  require("./locationScripts/realtimeboard.ts")();
      //} else if (hostMatches(".*.?37signals.com") || hostMatches(".*.basecamp.com")) {       //NEED TO DO DB WORK
      //  require("./locationScripts/basecamp.ts")();
      //} else if (hostMatches(".*.?humanity.com")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/humanity.ts")();
    } else if (hostMatches(".*.?qualaroo.com")) {
      require("./locationScripts/qualaroo.ts")();
      //} else if (hostMatches(".*.?infusionsoft.com") || hostMatches(".*.?infusionsoft.app")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/infusion.ts")();
      //} else if (hostMatches(".*.?buzzsumo.com")) {        //NEED TO DO DB WORK
      //  require("./locationScripts/buzzsumo.ts")();
      //} else if (hostMatches(".*.?logmeininc.com") || hostMatches(".*.?gotomeeting.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/gotomeeting.ts")();
      //} else if (hostMatches(".*.?calendly.com")) {
      //  require("./locationScripts/calendly.ts")();
      //} else if (hostMatches(".*.?teamwork.com")) {   //NEED TO DO DB WORK
      //  require("./locationScripts/teamwork.ts")();
      //} else if (hostMatches(".*.?asana.com")) {
      //  require("./locationScripts/asana.ts")();
    } else if (hostMatches(".*.?shopify.de")) {
      require("./locationScripts/shopify.ts")();
      //} else if (hostMatches(".*.?expensify.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/expensify.ts")();
      //} else if (hostMatches(".*.?typeform.com")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/typeform.ts")();
    } else if (hostMatches(".*.?surveysparrow.com")) {
      require("./locationScripts/surveysparrow.ts")();
    } else if (hostMatches(".*.?openproject.com")) {
      require("./locationScripts/openproject.ts")();
      //} else if (hostMatches(".*.?getminute.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/getminute.ts")();
    } else if (hostMatches(".*.?supersaas.de")) {
      require("./locationScripts/supersaas.ts")();
      //} else if (hostMatches(".*.?papershift.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/papershift.ts")();
    } else if (hostMatches(".*.?sevdesk.de")) {
      require("./locationScripts/sevdesk.ts")();
      //} else if (hostMatches(".*.?freshworks.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/freshworks.ts")();
      //} else if (hostMatches(".*.?freedcamp.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/freedcamp.ts")();
    } else if (hostMatches(".*.?zoho.com")) {
      require("./locationScripts/zoho.ts")();
      //} else if (hostMatches(".*.?pipelinedeals.com")) {        //NEED TO DO DB WORK
      //  require("./locationScripts/pipelinedeals.ts")();
      //} else if (hostMatches(".*.?agilecrm.com")) {         //NEED TO DO DB WORK
      //  require("./locationScripts/agilecrm.ts")();
      //} else if (hostMatches(".*.?ladesk.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/liveagent.ts")();
    } else if (hostMatches(".*.?livechatinc.com")) {
      require("./locationScripts/livechat.ts")();
      //} else if (hostMatches(".*.?groovehq.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/groove.ts")();
    } else if (hostMatches(".*.?scoop.it")) {
      require("./locationScripts/scoop.ts")();
      //} else if (hostMatches(".*.?instapage.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/instapage.ts")();
      //} else if (hostMatches(".*.?landingi.com")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/landingi.ts")();
    } else if (hostMatches(".*.?vwo.com")) {
      require("./locationScripts/vwo.ts")();
      //} else if (hostMatches(".*.?appcues.com")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/appcues.ts")();
      //} else if (hostMatches(".*.?inlinemanual.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/inlinemanual.ts")();
      //} else if (hostMatches(".*.?hotjar.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/hotjar.ts")();
    } else if (hostMatches(".*.?fullstory.com")) {
      require("./locationScripts/fullstory.ts")();
      //} else if (hostMatches(".*.?mailchimp.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/mailchimp.ts")();
    } else if (hostMatches(".*.?shortstackapp.com")) {
      require("./locationScripts/shortstack.ts")();
      //} else if (hostMatches(".*.?amplitude.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/amplitude.ts")();
      //} else if (hostMatches(".*.?mixpanel.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/mixpanel.ts")();
    } else if (hostMatches(".*.?statcounter.com")) {
      require("./locationScripts/statcounter.ts")();
    } else if (hostMatches(".*.?woopra.com")) {
      require("./locationScripts/woopra.ts")();
      //} else if (hostMatches(".*.?gosquared.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/gosquared.ts")();
    } else if (hostMatches(".*.?seranking.com")) {
      require("./locationScripts/seranking.ts")();
    } else if (hostMatches(".*.?socialbakers.com")) {
      require("./locationScripts/socialbakers.ts")();
      //} else if (hostMatches(".*.?facebook.com")) {
      //  require("./locationScripts/facebook.ts")();
      //} else if (hostMatches(".*.?instagram.com")) {   //NEED TO DO DB WORK
      //  require("./locationScripts/instagram.ts")();
      //} else if (hostMatches(".*.?twitter.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/twitter.ts")();
      //} else if (hostMatches(".*.?linkedin.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/linkedin.ts")();
      //} else if (hostMatches(".*.?buffer.com")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/buffer.ts")();
    } else if (hostMatches(".*.?statusbrew.com")) {
      require("./locationScripts/statusbrew.ts")();
      //} else if (hostMatches(".*.?brand24.com")) {        //NEED TO DO DB WORK
      //  require("./locationScripts/brand24.ts")();
      //} else if (hostMatches(".*.?agorapulse.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/agorapulse.ts")();
      //} else if (hostMatches(".*.?eclincher.com")) {     //NEED TO DO DB WORK
      //  require("./locationScripts/eclincher.ts")();
      //} else if (hostMatches(".*.?icontact.com")) {      //NEED TO DO DB WORK
      //  require("./locationScripts/icontact.ts")();
    } else if (hostMatches(".*.?sendible.com")) {
      require("./locationScripts/sendible.ts")();
      //} else if (hostMatches(".*.?createsend.com")) {
      //  require("./locationScripts/campainmonitor.ts")();    //NEED TO DO DB WORK
    } else if (hostMatches(".*.?robly.com")) {
      require("./locationScripts/robly.ts")();
    } else if (hostMatches(".*.?sendpulse.com")) {
      require("./locationScripts/sendpulse.ts")();
      //} else if (hostMatches(".*.?esignlive.eu")) {          //NEED TO DO DB WORK
      //  require("./locationScripts/esignlive.ts")();
    } else if (hostMatches(".*.?signnow.com")) {
      require("./locationScripts/signnow.ts")();
    } else if (hostMatches(".*.?getsigneasy.com")) {
      require("./locationScripts/signeasy.ts")();
      //} else if (hostMatches(".*.?insuresign.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/insuresign.ts")();
      //} else if (hostMatches(".*.?eversign.com")) {        //NEED TO DO DB WORK
      //  require("./locationScripts/eversign.ts")();
      //} else if (hostMatches(".*.?pandadoc.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/pandadoc.ts")();
      //} else if (hostMatches(".*.?e-sign.co.uk")) {       //NEED TO DO DB WORK
      //  require("./locationScripts/esign.ts")();
      //} else if (hostMatches(".*.?getaccept.com")) {       //NEED TO DO DB WORK
      //  require("./locationScripts/getaccept.ts")();
    } else if (hostMatches(".*.?polleverywhere.com")) {
      require("./locationScripts/polleverywhere.ts")();
    } else if (hostMatches(".*.?sli.do")) {
      require("./locationScripts/slido.ts")();
      //} else if (hostMatches(".*.?glisser.com")) {       //NEED TO DO DB WORK
      //  require("./locationScripts/glisser.ts")();
      //} else if (hostMatches(".*.?eventzilla.net")) {        //NEED TO DO DB WORK
      //  require("./locationScripts/eventzilla.ts")();
      //} else if (hostMatches(".*.?grenadine.co")) {       //NEED TO DO DB WORK
      //  require("./locationScripts/grenadine.ts")();
    } else if (hostMatches(".*.?meetingmatrix.com")) {
      require("./locationScripts/meetingmatrix.ts")();
      //} else if (hostMatches(".*.?allseated.com")) {        //NEED TO DO DB WORK
      //  require("./locationScripts/allseated.ts")();
      //} else if (hostMatches(".*.?activehosted.com")) {   //NEED TO DO DB WORK
      //  require("./locationScripts/activehosted.ts")();
      //} else if (hostMatches(".*.?omnisend.com")) {    //NEED TO DO DB WORK
      //  require("./locationScripts/omnisend.ts")();
    } else if (hostMatches(".*.?callrail.com")) {
      require("./locationScripts/callrail.ts")();
    } else {
      con.log(`No Script for ${hostname}`);
    }
    con.log(`Executed Script for ${hostname}`);
  } catch (e) {
    con.log(e.stack);
    con.log(`Executed Script for ${hostname}`);
  }
  // } else {
  //   console.log("WUNDERLIST");
  // }
  //});
}

// convert existing keys into simplified format
function normalizeKey(key) {
  if (key.emailtype ? key.emailtype == 2 : key.type == 2) {
    key.emailobject = "#" + key.emailobject;
    key.emailtype = 1;
  }
  if (key.passwordtype ? key.passwordtype == 2 : key.type == 2) {
    key.passwordobject = "#" + key.passwordobject;
    key.passwordtype = 1;
  }
  if (key.buttontype ? key.buttontype == 2 : key.type == 2) {
    key.buttonobject = "#" + key.buttonobject;
    key.buttontype = 1;
  }
  if (key.button1type == 2) {
    key.button1object = "#" + key.button1object;
    key.button1type = 1;
  }
  if (key.button2type == 2) {
    key.button2object = "#" + key.button2object;
    key.button2type = 1;
  }
  if (!key.button1object) {
    key.button1object = key.buttonobject;
  }
  if (!key.button2object) {
    key.button2object = key.buttonobject;
  }
  if (key.emptyerrortype) {
    key.errorobject = key.errorobject + ":not(:empty)";
    key.emptyerrortype = undefined;
  }
  return key;
}

function getLoginDetails(askfordata) {
  let repeatpossible = true;
  let clicked = false;
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("startLoginIn");
  ipcRenderer.send("TESTMESSAGE");

  ipcRenderer.sendToHost("getLoginDetails", askfordata);
  console.log("GETD");
  ipcRenderer.once("loginDetails", (e, key) => {
    console.log("ONCE");
    console.log("LOGINDETAILS", key);

    key = normalizeKey(key);

    let hideObject = !!(
      document.querySelector<HTMLInputElement>(key.hideobject) ||
      document.getElementById(key.hideobject)
    );
    const errorObject =
      document.querySelector<HTMLInputElement>(key.errorobject) ||
      document.getElementById(key.errorobject);
    const waitUntil =
      document.querySelector<HTMLInputElement>(key.waituntil) ||
      document.getElementById(key.waituntil);

    const emailObject = document.querySelector<HTMLInputElement>(key.emailobject);
    const passwordObject = document.querySelector<HTMLInputElement>(key.passwordobject);
    const buttonObject = document.querySelector<HTMLInputElement>(key.buttonobject);
    const button1Object = document.querySelector<HTMLInputElement>(key.button1object);
    const button2Object = document.querySelector<HTMLInputElement>(key.button2object);
    const rememberObject = document.querySelector<HTMLInputElement>(key.rememberobject);

    if (!key.hideobject) {
      hideObject = !passwordObject;
    }

    if (hideObject) {
      ipcRenderer.sendToHost("hideLoading");
      ipcRenderer.sendToHost("loggedIn");
      return;
    }

    if (askfordata > 50 || errorObject) {
      console.log("STOP RETRY", askfordata, errorObject);
      ipcRenderer.sendToHost("errorDetected");
      return;
    }

    if (key.loggedIn) {
      ipcRenderer.sendToHost("hideLoading");
      console.log("already loggedIn");
      return;
    }

    if (!waitUntil && !hideObject) {
      setTimeout(() => getLoginDetails(askfordata + 1), 50);
      return;
    }

    if (key.type) {
      console.log("TEST", key.passwordobject, passwordObject);
      if ((key.type == 1 || key.type == 2) && passwordObject) {
        askfordata++;
        console.log("TYPE 1|2", key.type == 1, key.type == 2, passwordObject);
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        fillFormField(emailObject!, username);
        fillFormField(passwordObject!, password);

        clickButton(buttonObject!);
        repeatpossible = false;
      } else if (key.type == 3 || key.type == 4 || key.type == 5) {
        console.log("TYPE 3");
        //Two Steps
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        console.log(emailObject && emailObject!.value == "" && !passwordObject);

        if (
          (emailObject && emailObject!.value == "" && !passwordObject && !hideObject) ||
          (key.type == 5 && !clicked && !hideObject)
        ) {
          console.log("EMAIL AND NO PASSWORD");
          askfordata++;
          fillFormField(emailObject!, username);

          clickButton(button1Object!);
        }

        if (
          (passwordObject && passwordObject!.value == "" && !hideObject) ||
          (key.type == 5 && clicked && !hideObject)
        ) {
          console.log("EMAIL AND PASSWORD");
          askfordata++;
          if (key.type == 3) {
            repeatpossible = false;
          }
          fillFormField(passwordObject!, password);
          clickButton(button2Object!);
        }
        if (key.type == 4 && rememberObject) {
          clickButton(rememberObject!);
          repeatpossible = false;
        }
      }
      hideLoading();

      if (
        (key.repeat || key.type == 3 || key.type == 4 || key.type == 5) &&
        repeatpossible &&
        !hideObject
      ) {
        if (key.type == 5) {
          clicked = true;
        }
        setTimeout(function() {
          getLoginDetails(askfordata);
        }, 50);
      }

      function hideLoading(r = 0) {
        if (!hideObject && !errorObject && r <= 50) {
          setTimeout(() => hideLoading(r++), 50);
        } else if (errorObject || r > 50) {
          ipcRenderer.sendToHost("errorDetected");
          return;
        } else {
          let ipcRenderer = require("electron").ipcRenderer;
          ipcRenderer.sendToHost("loggedIn");
          ipcRenderer.sendToHost("hideLoading");
        }
      }
    } else {
      console.log("NOTYPE");
    }
  });
}

function clickButton(targetNode: HTMLElement): void {
  triggerMouseEvent(targetNode, "mouseover");
  setTimeout(() => {
    triggerMouseEvent(targetNode, "mousedown");
    setTimeout(() => {
      triggerMouseEvent(targetNode, "mouseup");
      triggerMouseEvent(targetNode, "click");
    }, 77);
  }, 146);
}

function triggerMouseEvent(node: HTMLElement, eventType: string): void {
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function fillFormField(target: HTMLInputElement, value: string) {
  target.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
  target.value = value;

  target.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  target.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
}
