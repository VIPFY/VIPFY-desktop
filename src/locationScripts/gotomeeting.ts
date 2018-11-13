import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onReady() {}

function onLoad() {

  if (pathname == "/login") {
    login();
  }
}

function login() {
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    document.getElementById('emailAddress')!.value = email;
    document.getElementById('password')!.value = password;
    document.getElementById("rememberMe").checked = true;
    document.getElementById("submit")!.click();

  });
}
