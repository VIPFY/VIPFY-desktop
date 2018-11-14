import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  let loginForm = document.getElementById("loginForm");
  let loginUser = document.getElementById("username");
  let loginPass = document.getElementById("IDToken2");

  console.log(loginForm);
  if (loginUser) {
    loginUsername(loginForm);
  }
  if (loginPass) {
    loginPwd();
  }
}

function onReady() {
  setInterval(modifyAll, 100);
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (document.getElementById("loginForm") || document.getElementById("IDToken2")) {
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

function loginUsername(form: Element) {
  console.log("filling in webex login form user");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;

    form.querySelector<HTMLInputElement>("input[name='username']")!.value = username;
    document.getElementById("login-btn-next").click();
  });
}

function loginPwd() {
  console.log("filling in webex login form password");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let password = key.password;

    document.getElementById("IDToken2").value = password;
    document.getElementById("Button1").click();
  });
}
