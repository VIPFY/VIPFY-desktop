import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  //let loginForm = document.getElementById("login_form");
  //console.log(loginForm);
  //if (loginForm) {
  //  login(loginForm);
  //}

  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("hideLoading");

  //ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    document.querySelector<HTMLInputElement>("input[name='email']")!.value = username;

    document
      .querySelector<HTMLInputElement>("input[name='email']")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

    document.querySelector<HTMLInputElement>("input[name='password']")!.value = password;

    document
      .querySelector<HTMLInputElement>("input[name='password']")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
  hideLoading();
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.querySelector<HTMLInputElement>("input[name='email']")) {
    setTimeout(hideLoading, 100);
  } else {
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("hideLoading");
  }
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (document.getElementById("login_form")) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    return;
  }
  if (loading) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
  }
}

function modifySettings() {}

function login(form: Element) {
  console.log("filling in meraki login form");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    form.querySelector<HTMLInputElement>("input[name='email']")!.value = username;
    form.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
    form.querySelector<HTMLInputElement>("input[name='remember_user']")!.checked = true;
    form.querySelector<HTMLInputElement>("input[name='commit']")!.click();
  });
}