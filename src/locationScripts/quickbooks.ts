import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
let clicked: boolean = false;
const { pathname } = window.location;

function onReady() {
  setInterval(modifyAll, 100);
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (!clicked && document.getElementById("ius-userid")) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    clicked = true;
    login();
    return;
  }
  if (loading && !document.getElementById("ius-userid")) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
    clicked = false;
  }
}

function onLoad() {
  //ipcRenderer.sendToHost("hideLoading");
  //if (pathname.includes("/login")) {
  // login();
  //}
}

function login() {
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    document.getElementById("ius-userid")!.value = email;
    document
      .getElementById("ius-userid")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    document
      .getElementById("ius-userid")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    document.getElementById<HTMLInputElement>("ius-password")!.value = password;
    document
      .getElementById("ius-password")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    document
      .getElementById("ius-password")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    document.getElementById<HTMLInputElement>("ius-remember")!.checked = true;
    document.getElementById<HTMLInputElement>("ius-sign-in-submit-btn")!.click();
  });
}
