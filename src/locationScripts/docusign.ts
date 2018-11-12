import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  let loginForm = document.getElementById("login");
  let loginUser = document.getElementById("username");
  let loginPass = document.getElementById("password");

  console.log(loginForm);
  if (loginUser) {
    loginUsername();
  }
  if (loginPass) {
    loginPwd(loginForm);
  }
}

function onReady() {}

function modifyAll() {}

function modifySettings() {}

function loginUsername() {
  console.log("filling in docusign login form user");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    document.getElementById("username").value = username;
    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
}

function loginPwd(form: Element) {
  console.log("filling in docusign login form password");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let password = key.password;

    document.getElementById("password").value = password;
    document
      .getElementById("password")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    form.querySelector<HTMLInputElement>("button[data-qa='submit-password']")!.submit();
  });
}
