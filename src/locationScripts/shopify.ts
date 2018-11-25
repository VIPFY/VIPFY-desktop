import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = false;
let login_form: Number;
const { pathname } = window.location;

function onReady() {
  //setInterval(modifyAll, 100);
}

function modifyAll() {

  let ipcRenderer = require("electron").ipcRenderer;
  if (document.getElementById("password")) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    return;
  }
  if (loading) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
  }
}

function onLoad() {
  ipcRenderer.sendToHost("hideLoading");
  if (pathname == "/login") {
    login_form = 0;
    login();
  }

  if (pathname == "admin/auth/login") {
    login_form = 1;
    login();
  }
}

function login() {
  if (
    document.getElementById("email") &&
    document.getElementById("password") &&
    document.querySelectorAll("button[class='marketing-button marketing-button--block marketing-form__button gutter-bottom']")[0]
  ) {
    console.log("filling in shopify login form password");
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.once("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("email").value = username;
      document.getElementById("email").dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      if (login_form == 0){
        document.getElementById("password").value = password;
        document.getElementById("password").dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      }
      if (login_form == 1){
        document.getElementById("Password").value = password;
        document.getElementById("Password").dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      }

      //document.getElementById("remember").click();

      clickSubmit();
    });
  } else {
    setTimeout(login, 100);
  }
}

function clickSubmit() {
  if (document.getElementsByClassName("marketing-button marketing-button--block marketing-form__button gutter-bottom").length > 0 ){
    console.log("KF");
    document.getElementsByClassName("marketing-button marketing-button--block marketing-form__button gutter-bottom")[0].click();
  }
  else if (document.getElementsByClassName("ui-button ui-button--primary ui-button--full-width dialog-submit").length > 0) {
    console.log("KF");
    document.getElementsByClassName("ui-button ui-button--primary ui-button--full-width dialog-submit")[0].click();
  } else {
    console.log("K");
    setTimeout(login, 50);
  }
}