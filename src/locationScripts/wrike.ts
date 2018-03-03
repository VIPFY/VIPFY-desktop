//TODO: buying Proofing&Approval gives me a "Request a quote" window. How to handle this?
//TODO: account deletion flow

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
}

function login() {
  document.querySelector("input[name='login']")!.value = "jf@vipfy.com";
  document.querySelector("input[name='pwd']")!.value = "ytaZGkuOVbIwgua3KdQY";
  document.querySelector("input[name='rememberMe']")!.checked = "checked";
  document.querySelector("button[id='submit-login-button']")!.click();
}