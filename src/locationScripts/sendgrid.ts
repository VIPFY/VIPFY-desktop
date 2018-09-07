import { ipcRenderer } from "electron";
import { hideByQuery, support} from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onLoad() {
  if (pathname == "/login") {
    login();
  }
}

function onReady() {

  setInterval(modifyAll, 100);

}

function login() {
  ipcRenderer.sendToHost("getLoginData", 27);
  ipcRenderer.on("loginData", function(e, key) {
    console.log(key);
    const username = key.username;
    const password = key.password;

    document.querySelector<HTMLInputElement>("input[id='usernameContainer-input-id']")!.value = username;
    document.querySelector<HTMLInputElement>("input[id='passwordContainer-input-id']")!.value = password;
    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
}

function modifyAll() {
  if (!support) {
    hideByQuery('a[href="https://app.sendgrid.com/settings/account"]', true);
    hideByQuery('a[href="https://app.sendgrid.com/settings/teammates"]', true);
    hideByQuery('a[href="https://app.sendgrid.com/settings/auth"]', true);
  }
}
