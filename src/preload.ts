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
    } else if (hostMatches("(www.)?dropbox.com")) {
      require("./locationScripts/dropbox.ts")();
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
    } else if (hostMatches(".*.?37signals.com") || hostMatches(".*.basecamp.com")) {
      require("./locationScripts/basecamp.ts")();
    } else if (hostMatches(".*.?humanity.com")) {
      require("./locationScripts/humanity.ts")();
    } else if (hostMatches(".*.?qualaroo.com")) {
      require("./locationScripts/qualaroo.ts")();
    } else if (hostMatches(".*.?infusionsoft.com") || hostMatches(".*.?infusionsoft.app")) {
      require("./locationScripts/infusion.ts")();
    } else if (hostMatches(".*.?buzzsumo.com")) {
      require("./locationScripts/buzzsumo.ts")();
    } else if (hostMatches(".*.?logmeininc.com") || hostMatches(".*.?gotomeeting.com")) {
      require("./locationScripts/gotomeeting.ts")();
    } else if (hostMatches(".*.?calendly.com")) {
      require("./locationScripts/calendly.ts")();
    } else if (hostMatches(".*.?teamwork.com")) {
      require("./locationScripts/teamwork.ts")();
    } else if (hostMatches(".*.?asana.com")) {
      require("./locationScripts/asana.ts")();
    } else if (hostMatches(".*.?shopify.de")) {
      require("./locationScripts/shopify.ts")();
    } else if (hostMatches(".*.?expensify.com")) {
      require("./locationScripts/expensify.ts")();
    } else if (hostMatches(".*.?typeform.com")) {
      require("./locationScripts/typeform.ts")();
    } else if (hostMatches(".*.?surveysparrow.com")) {
      require("./locationScripts/surveysparrow.ts")();
    } else if (hostMatches(".*.?openproject.com")) {
      require("./locationScripts/openproject.ts")();
    } else if (hostMatches(".*.?getminute.com")) {
      require("./locationScripts/getminute.ts")();
    } else if (hostMatches(".*.?supersaas.de")) {
      require("./locationScripts/supersaas.ts")();
    } else if (hostMatches(".*.?papershift.com")) {
      require("./locationScripts/papershift.ts")();
    } else if (hostMatches(".*.?sevdesk.de")) {
      require("./locationScripts/sevdesk.ts")();
    } else if (hostMatches(".*.?freshworks.com")) {
      require("./locationScripts/freshworks.ts")();
    } else if (hostMatches(".*.?freedcamp.com")) {
      require("./locationScripts/freedcamp.ts")();
    } else if (hostMatches(".*.?zoho.com")) {
      require("./locationScripts/zoho.ts")();
    } else if (hostMatches(".*.?pipelinedeals.com")) {
      require("./locationScripts/pipelinedeals.ts")();
    } else if (hostMatches(".*.?agilecrm.com")) {
      require("./locationScripts/agilecrm.ts")();
    } else if (hostMatches(".*.?ladesk.com")) {
      require("./locationScripts/liveagent.ts")();
    } else if (hostMatches(".*.?livechatinc.com")) {
      require("./locationScripts/livechat.ts")();
    } else if (hostMatches(".*.?groovehq.com")) {
      require("./locationScripts/groove.ts")();
    } else if (hostMatches(".*.?scoop.it")) {
      require("./locationScripts/scoop.ts")();
    } else if (hostMatches(".*.?instapage.com")) {
      require("./locationScripts/instapage.ts")();
    } else if (hostMatches(".*.?landingi.com")) {
      require("./locationScripts/landingi.ts")();
    } else if (hostMatches(".*.?vwo.com")) {
      require("./locationScripts/vwo.ts")();
    } else if (hostMatches(".*.?appcues.com")) {
      require("./locationScripts/appcues.ts")();
    } else if (hostMatches(".*.?inlinemanual.com")) {
      require("./locationScripts/inlinemanual.ts")();
    } else if (hostMatches(".*.?hotjar.com")) {
      require("./locationScripts/hotjar.ts")();
    } else if (hostMatches(".*.?fullstory.com")) {
      require("./locationScripts/fullstory.ts")();
    } else if (hostMatches(".*.?mailchimp.com")) {
      require("./locationScripts/mailchimp.ts")();
    } else if (hostMatches(".*.?shortstackapp.com")) {
      require("./locationScripts/shortstack.ts")();
    } else if (hostMatches(".*.?amplitude.com")) {
      require("./locationScripts/amplitude.ts")();
    } else if (hostMatches(".*.?mixpanel.com")) {
      require("./locationScripts/mixpanel.ts")();
    } else if (hostMatches(".*.?statcounter.com")) {
      require("./locationScripts/statcounter.ts")();
    } else if (hostMatches(".*.?woopra.com")) {
      require("./locationScripts/woopra.ts")();
    } else if (hostMatches(".*.?gosquared.com")) {
      require("./locationScripts/gosquared.ts")();
    } else if (hostMatches(".*.?seranking.com")) {
      require("./locationScripts/seranking.ts")();
    } else if (hostMatches(".*.?socialbakers.com")) {
      require("./locationScripts/socialbakers.ts")();
      //} else if (hostMatches(".*.?facebook.com")) {
      //  require("./locationScripts/facebook.ts")();
    } else if (hostMatches(".*.?instagram.com")) {
      require("./locationScripts/instagram.ts")();
    } else if (hostMatches(".*.?twitter.com")) {
      require("./locationScripts/twitter.ts")();
    } else if (hostMatches(".*.?linkedin.com")) {
      require("./locationScripts/linkedin.ts")();
    } else if (hostMatches(".*.?buffer.com")) {
      require("./locationScripts/buffer.ts")();
    } else if (hostMatches(".*.?statusbrew.com")) {
      require("./locationScripts/statusbrew.ts")();
    } else if (hostMatches(".*.?brand24.com")) {
      require("./locationScripts/brand24.ts")();
    } else if (hostMatches(".*.?agorapulse.com")) {
      require("./locationScripts/agorapulse.ts")();
    } else if (hostMatches(".*.?eclincher.com")) {
      require("./locationScripts/eclincher.ts")();
    } else if (hostMatches(".*.?icontact.com")) {
      require("./locationScripts/icontact.ts")();
    } else if (hostMatches(".*.?sendible.com")) {
      require("./locationScripts/sendible.ts")();
    } else if (hostMatches(".*.?createsend.com")) {
      require("./locationScripts/campainmonitor.ts")();
    } else if (hostMatches(".*.?robly.com")) {
      require("./locationScripts/robly.ts")();
    } else if (hostMatches(".*.?sendpulse.com")) {
      require("./locationScripts/sendpulse.ts")();
    } else if (hostMatches(".*.?esignlive.eu")) {
      require("./locationScripts/esignlive.ts")();
    } else if (hostMatches(".*.?signnow.com")) {
      require("./locationScripts/signnow.ts")();
    } else if (hostMatches(".*.?getsigneasy.com")) {
      require("./locationScripts/signeasy.ts")();
    } else if (hostMatches(".*.?insuresign.com")) {
      require("./locationScripts/insuresign.ts")();
    } else if (hostMatches(".*.?eversign.com")) {
      require("./locationScripts/eversign.ts")();
    } else if (hostMatches(".*.?pandadoc.com")) {
      require("./locationScripts/pandadoc.ts")();
    } else if (hostMatches(".*.?e-sign.co.uk")) {
      require("./locationScripts/esign.ts")();
    } else if (hostMatches(".*.?getaccept.com")) {
      require("./locationScripts/getaccept.ts")();
    } else if (hostMatches(".*.?polleverywhere.com")) {
      require("./locationScripts/polleverywhere.ts")();
    } else if (hostMatches(".*.?sli.do")) {
      require("./locationScripts/slido.ts")();
    } else if (hostMatches(".*.?glisser.com")) {
      require("./locationScripts/glisser.ts")();
    } else if (hostMatches(".*.?eventzilla.net")) {
      require("./locationScripts/eventzilla.ts")();
    } else if (hostMatches(".*.?grenadine.co")) {
      require("./locationScripts/grenadine.ts")();
    } else if (hostMatches(".*.?meetingmatrix.com")) {
      require("./locationScripts/meetingmatrix.ts")();
    } else if (hostMatches(".*.?allseated.com")) {
      require("./locationScripts/allseated.ts")();
    } else if (hostMatches(".*.?activehosted.com")) {
      require("./locationScripts/activehosted.ts")();
    } else if (hostMatches(".*.?omnisend.com")) {
      require("./locationScripts/omnisend.ts")();
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
function getLoginDetails(askfordata) {
  let repeatpossible = true;
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("startLoginIn");
  ipcRenderer.send("TESTMESSAGE");

  ipcRenderer.sendToHost("getLoginDetails", askfordata);
  console.log("GETD");
  ipcRenderer.once("loginDetails", (e, key) => {
    console.log("ONCE");
    console.log("LOGINDETAILS", key);

    if (
      askfordata > 50 ||
      (document.querySelector<HTMLInputElement>(key.errorobject) ||
        document.getElementById(key.errorobject))
    ) {
      console.log(
        "STOP RETRY",
        askfordata,
        document.querySelector<HTMLInputElement>(key.errorobject) ||
          document.getElementById(key.errorobject)
      );
      ipcRenderer.sendToHost("errorDetected");
      return;
    }

    if (key.loggedIn) {
      ipcRenderer.sendToHost("hideLoading");
      console.log("already loggedIn");
      return;
    }

    if (key.type) {
      if (
        (key.type == 1 || key.type == 2) &&
        (document.querySelector<HTMLInputElement>(key.passwordobject) ||
          document.getElementById(key.passwordobject))
      ) {
        askfordata++;
        console.log(
          "TYPE 1|2",
          key.type == 1,
          key.type == 2,
          document.querySelector<HTMLInputElement>(key.passwordobject),
          document.getElementById(key.passwordobject)
        );
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        if (key.emailtype ? key.emailtype == 1 : key.type == 1) {
          document
            .querySelector<HTMLInputElement>(key.emailobject)!
            .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
          document.querySelector<HTMLInputElement>(key.emailobject)!.value = username;

          document
            .querySelector<HTMLInputElement>(key.emailobject)!
            .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

          document
            .querySelector<HTMLInputElement>(key.emailobject)!
            .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        } else {
          document
            .getElementById(key.emailobject)!
            .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
          document.getElementById(key.emailobject)!.value = username;
          document
            .getElementById(key.emailobject)!
            .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

          document
            .getElementById(key.emailobject)!
            .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        }

        if (key.passwordtype ? key.passwordtype == 1 : key.type == 1) {
          document
            .querySelector<HTMLInputElement>(key.passwordobject)!
            .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
          document.querySelector<HTMLInputElement>(key.passwordobject)!.value = password;

          document
            .querySelector<HTMLInputElement>(key.passwordobject)!
            .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

          document
            .querySelector<HTMLInputElement>(key.passwordobject)!
            .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        } else {
          document
            .getElementById(key.passwordobject)!
            .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
          document.getElementById(key.passwordobject)!.value = password;

          document
            .getElementById(key.passwordobject)!
            .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

          document
            .getElementById(key.passwordobject)!
            .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        }

        if (key.buttontype ? key.buttontype == 1 : key.type == 1) {
          clickButton(document.querySelector<HTMLInputElement>(key.buttonobject));
        } else {
          clickButton(document.getElementById(key.buttonobject));
        }
        repeatpossible = false;
      } else if (key.type == 3 || key.type == 4) {
        console.log("TYPE 3");
        //Two Steps
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        console.log(
          (document.querySelector<HTMLInputElement>(key.emailobject)
            ? document.querySelector<HTMLInputElement>(key.emailobject)!.value == ""
            : false || document.getElementById(key.emailobject)
            ? document.getElementById(key.emailobject)!.value == ""
            : false) &&
            !(
              document.querySelector<HTMLInputElement>(key.passwordobject) ||
              document.getElementById(key.passwordobject)
            )
        );

        if (
          (document.querySelector<HTMLInputElement>(key.emailobject)
            ? document.querySelector<HTMLInputElement>(key.emailobject)!.value == ""
            : false || document.getElementById(key.emailobject)
            ? document.getElementById(key.emailobject)!.value == ""
            : false) &&
          !(
            document.querySelector<HTMLInputElement>(key.passwordobject) ||
            document.getElementById(key.passwordobject)
          )
        ) {
          console.log("EMAIL AND NO PASSWORD");
          askfordata++;
          if (key.emailtype ? key.emailtype == 1 : key.type == 1) {
            document
              .querySelector<HTMLInputElement>(key.emailobject)!
              .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
            document.querySelector<HTMLInputElement>(key.emailobject)!.value = username;

            document
              .querySelector<HTMLInputElement>(key.emailobject)!
              .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

            document
              .querySelector<HTMLInputElement>(key.emailobject)!
              .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          } else {
            document
              .getElementById(key.emailobject)!
              .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
            document.getElementById(key.emailobject)!.value = username;
            document
              .getElementById(key.emailobject)!
              .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

            document
              .getElementById(key.emailobject)!
              .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          }

          if (key.button1object) {
            if (key.button1type == 1) {
              clickButton(document.querySelector<HTMLInputElement>(key.button1object)!);
            } else {
              clickButton(document.getElementById(key.button1object)!);
            }
          } else {
            if (key.buttontype == 1) {
              clickButton(document.querySelector<HTMLInputElement>(key.buttonobject)!);
            } else {
              clickButton(document.getElementById(key.buttonobject)!);
            }
          }
        }

        console.log(
          "CHECK TYPE 3",
          (document.querySelector<HTMLInputElement>(key.emailobject) ||
            document.getElementById(key.emailobject) ||
            document.querySelector<HTMLInputElement>(key.emailpassobject) ||
            document.getElementById(key.emailpassobject) ||
            key.nopassobject) &&
            (document.querySelector<HTMLInputElement>(key.passwordobject) ||
              document.getElementById(key.passwordobject)),
          document.querySelector<HTMLInputElement>(key.emailobject) ||
            document.getElementById(key.emailobject) ||
            document.querySelector<HTMLInputElement>(key.emailpassobject) ||
            document.getElementById(key.emailpassobject) ||
            key.nopassobject,
          document.querySelector<HTMLInputElement>(key.passwordobject) ||
            document.getElementById(key.passwordobject)
        );
        if (
          (document.querySelector<HTMLInputElement>(key.emailobject) ||
            document.getElementById(key.emailobject) ||
            document.querySelector<HTMLInputElement>(key.emailpassobject) ||
            document.getElementById(key.emailpassobject) ||
            key.nopassobject) &&
          (document.querySelector<HTMLInputElement>(key.passwordobject)
            ? document.querySelector<HTMLInputElement>(key.passwordobject)!.value == ""
            : false || document.getElementById(key.passwordobject)
            ? document.getElementById(key.passwordobject)!.value == ""
            : false)
        ) {
          console.log("EMAIL AND PASSWORD");
          askfordata++;
          if (key.type == 3) {
            repeatpossible = false;
          }
          if (key.passwordtype ? key.passwordtype == 1 : key.type == 1) {
            document
              .querySelector<HTMLInputElement>(key.passwordobject)!
              .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
            document.querySelector<HTMLInputElement>(key.passwordobject)!.value = password;

            document
              .querySelector<HTMLInputElement>(key.passwordobject)!
              .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

            document
              .querySelector<HTMLInputElement>(key.passwordobject)!
              .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          } else {
            document
              .getElementById(key.passwordobject)!
              .dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
            document.getElementById(key.passwordobject)!.value = password;

            document
              .getElementById(key.passwordobject)!
              .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

            document
              .getElementById(key.passwordobject)!
              .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
          }

          if (key.button2object) {
            if (key.button2type == 1) {
              clickButton(document.querySelector<HTMLInputElement>(key.button2object)!);
            } else {
              clickButton(document.getElementById(key.button2object)!);
            }
          } else {
            if (key.buttontype == 1) {
              clickButton(document.querySelector<HTMLInputElement>(key.buttonobject)!);
            } else {
              clickButton(document.getElementById(key.buttonobject)!);
            }
          }
        }
        if (key.type == 4 && document.querySelector<HTMLInputElement>(key.rememberobject)) {
          clickButton(document.querySelector<HTMLInputElement>(key.rememberobject)!);
          repeatpossible = false;
        }
      }
      hideLoading();

      if (
        (key.repeat || key.type == 3 || key.type == 4) &&
        repeatpossible &&
        !(
          document.querySelector<HTMLInputElement>(key.hideobject) ||
          document.getElementById(key.hideobject)
        )
      ) {
        setTimeout(function() {
          getLoginDetails(askfordata);
        }, 50);
      }

      function hideLoading(r = 0) {
        if (
          ((key.type == 1 || key.type == 2 || key.hidetype == 1 || key.hidetype == 2) &&
            key.hidetype != 3 &&
            (document.querySelector<HTMLInputElement>(key.passwordobject) ||
              document.getElementById(key.passwordobject)) &&
            !(
              document.querySelector<HTMLInputElement>(key.errorobject) ||
              document.getElementById(key.errorobject)
            )) ||
          ((key.type == 3 || key.hidetype == 3 || key.type == 4 || key.hidetype == 4) &&
            !(
              document.querySelector<HTMLInputElement>(key.hideobject) ||
              document.getElementById(key.hideobject)
            ) &&
            !(
              document.querySelector<HTMLInputElement>(key.errorobject) ||
              document.getElementById(key.errorobject)
            ) &&
            r <= 50)
        ) {
          console.log(
            "Still Hiding",
            document.querySelector<HTMLInputElement>(key.errorobject) ||
              document.getElementById(key.errorobject)
          );
          setTimeout(() => hideLoading(r++), 50);
        } else if (
          document.querySelector<HTMLInputElement>(key.errorobject) ||
          document.getElementById(key.errorobject) ||
          r > 50
        ) {
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
  // if (key.type !== 1) {
  console.log("NOT 1");
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
