import { ipcRenderer } from "electron";
import { con, todoPath, hideByQuery, redirectLinks, redirectLinksByQuery, support, supportKeyCode } from "./utils/util";


let hideKeyArray: Array<string> = ["#username", 'input[name="user[email]"]', "#email"];
let hideHRefArray: Array<string> = ['#email-sync"]', '/settings/calendar-sync"]', '#gsync"]', '#files"]', '#mailchimp"]',
  '#password"]', '/settings/login-verification"]', '/users/add"]', '/settings/users"]', '/settings/users"]', '/mail"]',
   '/auth/logout"]', '/users/index"]', '/settings/invites"]', '/settings/change_billing"]', '/settings/billing"]', '/settings/sso"]' ];


module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  if (window.location.pathname == "/auth/login") {
    login();
  }
}

function onReady() {

  setInterval(modifyAll, 100);

}

function login() {
  ipcRenderer.sendToHost("getLoginData", 4);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.email;
    let password = key.password;
    document.querySelector<HTMLInputElement>("input[name='login']")!.value = email;
    document.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
    document.querySelector<HTMLInputElement>("input[name='remember']")!.checked = true;
    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
}

function modifyAll() {

  //if (<KeyboardEvent>window.event).

  if (!support) {
   //redirect to own marketplace
    //the following two should apply equally to most instances, but there are occasional exceptions
    // TODO something does not work on some sites with this link   href="vipfy://marketplace/4/changeplan/"
    redirectLinksByQuery("a.tierChangeStandaloneModal", "vipfy://marketplace/4/changeplan/");
    redirectLinks("#dialog/tier-plan-standalone", "vipfy://marketplace/4/changeplan/");
    //hide upgrade plan if redirect is impossible
    hideByQuery('a[data-tracking-component-code="upgradePlan_link"]', true);

    hideByQuery('div[class="iamClient__GettingStartedV2 iamClient__GettingStartedV2--open iam___Sidebar___3k0hd3k0 iam___GSPanel___1VdeC1Vd"]', true);

   //Settings
    //hide user settings
    for (let entry of hideKeyArray) {
      console.log("hide: " + entry); // 1, "string", false
      hideByQuery(entry, true);
    }

    //hide administration, navigation
    //hide menu
    //hide billing
    for (let entry of hideHRefArray) {
      console.log("hide: " + entry); // 1, "string", false
      hideByQuery('a[href="https://'.concat(window.location.host.concat(entry)), true);
      hideByQuery('a[href="' + entry, true);
    }
    /*/hide connections
    //hide Space TODO hideByQuery('<div class="vertical-nav__item vertical-nav__item--category">                  Verbindungen                </div>', false);

    //hide security
    //hide space TODO hideByQuery('<div class="vertical-nav__item vertical-nav__item--category">                  Einstellungen               </div>', true);



   }
}



