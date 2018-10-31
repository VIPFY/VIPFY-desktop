import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  let loginForm = document.getElementById("loginForm");
  let loginUser = document.getElementById("resolving_input");
  let loginPass = document.getElementById("IDToken2");

  console.log(loginForm);
  if (loginUser) {
    loginUsername();
  }
  if (loginPass) {
    loginPwd();
  }
}

function onReady() {}

function modifyAll() {}

function modifySettings() {}

function loginUsername() {
  console.log("filling in webex login form user");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {

    console.log("KEY", key);
    let username = key.username;
    document.getElementById("resolving_input").value = username;
//    form.querySelector<HTMLInputElement>("input[name='username']")!.value = username;
    document.getElementById("next_button").click();

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
