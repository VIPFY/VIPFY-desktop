import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  console.log("ONLOAD");
  let loginForm = document
    .querySelectorAll("iframe")[0]
    .contentWindow.document.querySelectorAll("form")[0];
  console.log(loginForm);
  if (loginForm) {
    login(loginForm);
  }
}

function onReady() {
  con.log(window.location.pathname);
  /*if (window.location.pathname.startsWith("/account")) {
    setInterval(modifySettings, 100);
    
  }*/
  setInterval(modifyAll, 100);
}

function modifyAll() {
  let element = document.getElementById("user");
  if (element) {
    element.parentNode.removeChild(element);
  }
}

function modifySettings() {}

function login(form: Element) {
  console.log("filling in support login form");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    form.querySelector<HTMLInputElement>("input[name='user[email]']")!.value = username;
    form.querySelector<HTMLInputElement>("input[name='user[password]']")!.value = password;
    form.querySelector<HTMLInputElement>("input[name='remember_me']")!.checked = true;
    form.querySelector<HTMLInputElement>("input[name='commit']")!.click();
  });
}
