import { ipcRenderer } from "electron";
import { con, todoPath, hideByQuery, redirectLinks, redirectLinksByQuery, support, supportKeyCode } from "./utils/util";

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

   //Settings
    //hide user settings
    hideByQuery("#username", true);
    hideByQuery('input[name="user[email]"]', true);
    hideByQuery("#email", true);
    hideByQuery('a[href="https://'.concat(window.location.host.concat('#google"]')), true);
    hideByQuery('a[href="#google"]', true);

    //hide connections
    //hide Space TODO hideByQuery('<div class="vertical-nav__item vertical-nav__item--category">                  Verbindungen                </div>', false);
    hideByQuery('a[href="https://'.concat(window.location.host.concat('#email-sync"]')), true);
    hideByQuery('a[href="#email-sync"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('/settings/calendar-sync"]')), true);
    hideByQuery('a[href="/settings/calendar-sync"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('#gsync"]')), true);
    hideByQuery('a[href="#gsync"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('#files"]')), true);
    hideByQuery('a[href="#files"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('#mailchimp"]')), true);
    hideByQuery('a[href="#mailchimp"]', true);

    //hide security
    //hide space TODO hideByQuery('<div class="vertical-nav__item vertical-nav__item--category">                  Einstellungen               </div>', true);
    hideByQuery('a[href="https://'.concat(window.location.host.concat('#password"]')), true);
    hideByQuery('a[href="#password"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('/settings/login-verification"]')), true);
    hideByQuery('a[href="/settings/login-verification"]', true);

    //administration
    hideByQuery('a[href="https://'.concat(window.location.host.concat('/users/add"]')), true);
    hideByQuery('a[href="/users/add"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('/settings/users"]')), true);
    hideByQuery('a[href="/settings/users"]', true);

   //hide navigation
    hideByQuery('a[href="https://'.concat(window.location.host.concat('/mail"]')), true);
    hideByQuery('a[href="/mail"]', true);

   //hide menu
    hideByQuery('a[href="https://'.concat(window.location.host.concat('/auth/logout"]')), true);
    hideByQuery('a[href="/auth/logout"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('/users/index"]')), true);
    hideByQuery('a[href="/users/index"]', true);

    hideByQuery('a[href="https://'.concat(window.location.host.concat('/settings/invites"]')), true);
    hideByQuery('a[href="/settings/invites"]', true);

    hideByQuery('a[href="/settings/change_billing"]', true);
    hideByQuery('a[href="/settings/billing"]', true);
    hideByQuery('a[href="/settings/sso"]', true);
    //hide upgrade plan if redirect is impossible
    hideByQuery('a[data-tracking-component-code="upgradePlan_link"]', true);
   }
}



