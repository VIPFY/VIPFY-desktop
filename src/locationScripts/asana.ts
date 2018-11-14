import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
const { pathname } = window.location;

function onReady() {
  setInterval(modifyAll, 100);
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (document.getElementById("password_input")) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    return;
  }
  if (loading) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
  }
}

function onLoad() {
  if (document.getElementById("password_input")) {
    login();
  }
}

function login() {
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    document.getElementById("email_input")!.value = email;
    document
      .getElementById("email_input")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    document.getElementById("password_input")!.value = password;
    document
      .getElementById("password_input")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    document.getElementById("submit_button")!.click();
  });
}
