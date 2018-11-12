import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onReady() {}

function onLoad() {

  if (pathname.includes("/login")) {
    login();
  }
}

function login() {
  // change to Appid of Freshbooks
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.cid;
    let password = key.password;

    document.getElementById<HTMLInputElement>("ius-userid")!.value = email;
    document.getElementById<HTMLInputElement>("ius-password")!.value = password;
    document.getElementById<HTMLInputElement>("ius-remember")!.checked = true;
    document.getElementById<HTMLInputElement>("ius-sign-in-submit-btn")!.click();

  });
}

