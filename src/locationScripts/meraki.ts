import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  let loginForm = document.getElementById("login_form");
  console.log(loginForm);
  if (loginForm) {
    login(loginForm);
  }
}

function onReady() {}

function modifyAll() {}

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
