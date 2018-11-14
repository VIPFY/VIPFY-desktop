import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  console.log("On load");
  let loginForm = document.getElementById("loginForm");
  let loginUser = document.getElementById("resolving_input");
  let loginPass = document.getElementById("IDToken2");

  console.log(loginForm);
  if (loginUser) {
    //loginUsername();
    console.log("loginuser");
  }
  if (loginPass) {
    //loginPwd();
    console.log("loginpass");
  }
}

function onReady() {
  console.log("READY");
  setInterval(modifyAll, 100);
}

function modifyAll() {
  //Username
  let ipcRenderer = require("electron").ipcRenderer;
  if (
    document.getElementById("signin_container") &&
    document.getElementById("signin_container")!.style.display !== "none" &&
    document.getElementById("resolving_input")!.value === ""
  ) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    console.log(
      "loginusername",
      document.getElementById("signin_container"),
      document.getElementById("signin_container")!.style.display !== "none",
      document.getElementById("resolving_input")!.value
    );
    loginUsername();
  } else if (
    document.getElementById("login_container") &&
    document.getElementById("login_container")!.style.display !== "none" &&
    document.getElementById("password")!.value === ""
  ) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    console.log(
      "Password now",
      document.getElementById("login_container"),
      document.getElementById("login_container")!.style.display !== "none",
      document.getElementById("password")!.value
    );
    loginPwd();
  } else {
    if (loading) {
      console.log("hide");
      ipcRenderer.sendToHost("hideLoading");
    }
    loading = false;
  }
}

function modifySettings() {}

function loginUsername() {
  console.log("filling in aws login form user");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    document.getElementById("resolving_input").value = username;
    //    form.querySelector<HTMLInputElement>("input[name='username']")!.value = username;
    document
      .getElementById("resolving_input")
      .dispatchEvent(new Event("keypress", { bubbles: true, cancelable: true }));
    document
      .getElementById("resolving_input")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    document
      .getElementById("resolving_input")
      .dispatchEvent(new Event("propertychange", { bubbles: true, cancelable: true }));
    document.getElementById("next_button").click();
  });
}

function loginPwd() {
  console.log("filling in aws login form password");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let password = key.password;

    //document.getElementById("IDToken2").value = password;
    //document.getElementById("Button1").click();
    document.getElementById("password").value = password;
    document.getElementById("signin_button").click();
  });
}
