import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  /*console.log("On load");
  let loginForm = document.getElementById("loginForm");
  let loginUser = document.getElementById("resolving_input");
  let loginPass = document.getElementById("IDToken2");

  console.log(loginForm);
  if (loginUser) {
    loginUsername();
  }
  if (loginPass) {
    loginPwd();
  }*/
}

function onReady() {
  console.log("READY");
  modifyAll();
}

function modifyAll() {
  if (
    document.querySelector("input[name='email']") &&
    document.querySelector("input[name='email']").value === ""
  ) {
    console.log("Username now");
    loginUsername();
  }
  if (
    document.querySelector("input[name='password']") &&
    document.querySelector("input[name='password']").value === ""
  ) {
    console.log("password now");
    loginPassword();
  }
  /*else if (
    document.querySelector("input[name='email']") &&
    document.querySelector("input[name='email']").value !== "" &&
    clicked
  ) {
    console.log("click");
    document.querySelector("input[type='submit']").click();
    clicked = false;
  } else {
    //setTimeout(b => modifyAll(b), 100);
  }
  password
  
  */
  setTimeout(modifyAll, 100);
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

    //document.getElementById("IDToken2").value = password;
    //document.getElementById("Button1").click();
    document.querySelector("input[name='password']").value = password;
    document
      .querySelector("input[name='password']")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    document.querySelector("input[type='submit']").click();
  });
}
