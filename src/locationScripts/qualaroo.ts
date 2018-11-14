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
  if (document.getElementById("user_session_password")) {
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
  if (pathname == "/signin") {
    login();
  }
}

function login() {
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    document.getElementById("user_session_email")!.value = email;
    document.getElementById("user_session_password")!.value = password;
    document.getElementById("user_session_remember_me").checked = true;
    document.getElementById("user_session_submit")!.click();
  });
}
