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
    } else if (hostMatches(".*.?trello.com")) {
      require("./locationScripts/trello.ts")();
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
    } else if (hostMatches(".*.?smartlook.com")) {
      require("./locationScripts/smartlook.ts")();
    } else if (hostMatches(".*.?papershift.com")) {
      require("./locationScripts/papershift.ts")();
    } else if (hostMatches(".*.?sevdesk.de")) {
      require("./locationScripts/sevdesk.ts")();
    } else if (hostMatches(".*.?freshworks.com")) {
      require("./locationScripts/freshworks.ts")();
    } else if (hostMatches(".*.?wunderlist.com")) {
      require("./locationScripts/wunderlist.ts")();
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
    } else if (hostMatches(".*.?facebook.com")) {
      require("./locationScripts/facebook.ts")();
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
    } else if (hostMatches(".*.?eventbrite.com")) {
      require("./locationScripts/eventbrite.ts")();
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
}
