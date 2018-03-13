//TODO: buying Proofing&Approval gives me a "Request a quote" window. How to handle this?
//TODO: account deletion flow
//TODO: user adding

import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  if (document.getElementById("submit-login-button")) {
    login();
  }
}

function onReady() {
  con.log(window.location.pathname);

  setInterval(modifyAll, 100);
}

function modifyAll() {
  redirectLinks("/accounts.htm#checkout", todoPath);
  hideByQuery("change-password-section", false);
}


function login() {
  document.querySelector<HTMLInputElement>("input[name='login']")!.value = "jf@vipfy.com";
  document.querySelector<HTMLInputElement>("input[name='pwd']")!.value = "ytaZGkuOVbIwgua3KdQY";
  document.querySelector<HTMLInputElement>("input[name='rememberMe']")!.checked = true;
  document.querySelector<HTMLInputElement>("button[id='submit-login-button']")!.click();
}