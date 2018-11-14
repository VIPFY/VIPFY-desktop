import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
let waitedalittle = false;

function onLoad() {}

function onReady() {
  //console.log("READY");
  setInterval(modifyAll, 100);
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (
    document.querySelector("input[name='email']") &&
    document.querySelector("input[name='email']").value === ""
  ) {
    //console.log("Username now");
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    waitedalittle = false;
    loginUsername();
    return;
  }
  if (
    document.querySelector("input[name='password']") &&
    document.querySelector("input[name='password']").value === ""
  ) {
    //console.log("password now");
    loginPassword();
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    waitedalittle = false;
    return;
  }
  //console.log(waitedalittle, loading);
  if (waitedalittle && loading) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
  } else if (loading) {
    waitedalittle = true;
  }
}

function modifySettings() {}

function loginUsername() {
  console.log("filling in calendly login form user");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.once("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    document.querySelector("input[name='email']").value = username;
    document
      .querySelector("input[name='email']")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    document.querySelector("input[type='submit']").click();
  });
}

function loginPassword() {
  console.log("filling in calendly login form password");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.once("loginData", (e, key) => {
    console.log("KEY2", key);
    let password = key.password;

    document.querySelector("input[name='password']").value = password;
    document
      .querySelector("input[name='password']")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    document.querySelector("input[type='submit']").click();
  });
}
