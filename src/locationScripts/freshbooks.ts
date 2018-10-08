import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

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

function login() {
  // change to Appid of Freshbooks
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.cid;
    let password = key.password;

    document.getElementById<HTMLInputElement>("smux_identity_email")!.value = email;
    document.getElementById<HTMLInputElement>("smux_identity_password")!.value = password;
    document.getElementById<HTMLInputElement>("button[name='commit']")!.click();
  });
}
