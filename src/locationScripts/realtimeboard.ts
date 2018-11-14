import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
const { pathname } = window.location;

function onLoad() {
  if (pathname == "/login/") {
    login();
  }
}

function onReady() {
  setInterval(modifyAll, 100);
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (document.querySelector<HTMLInputElement>("input[name='password']")) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    return;
  }
  if (loading) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
  }
}

function login() {
  // change to Appid of Freshbooks
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    document.querySelector<HTMLInputElement>("input[name='email']")!.value = email;
    document.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
    document.querySelector<HTMLInputElement>("button[class='signup__submit']")!.click();
  });
}
