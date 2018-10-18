import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  let loginForm = document.getElementById("divSignInPage");
  console.log(loginForm);
  if (loginForm) {
    login(loginForm);
  }
}

function onReady() {
  /*con.log(window.location.pathname);
  if (window.location.pathname.startsWith("/account")) {
    setInterval(modifySettings, 100);
    
  }
  setInterval(modifyAll, 100);*/
}

function modifyAll() {}

function modifySettings() {}

function login(form: Element) {
  console.log("filling in vistaprint login form");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    form.querySelector<HTMLInputElement>("input[name='txtEmail']")!.value = username;
    form.querySelector<HTMLInputElement>("input[name='txtSignInPassword']")!.value = password;
    form.querySelector<HTMLInputElement>("input[name='chkRememberMe']")!.checked = true;
    form.querySelector<HTMLInputElement>("button[name='btnSignIn']")!.click();
  });
}
