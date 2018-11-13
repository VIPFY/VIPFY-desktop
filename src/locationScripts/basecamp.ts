import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onReady() {}

function onLoad() {

  if (pathname == "/signin") {
    login();
  }
}

function login() {
  // change to Appid of Freshbooks
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    document.getElementById("username")!.value = email;
    document.querySelector<HTMLInputElement>("button[data-role='next_button']")!.click();
    document.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
    document.querySelector<HTMLInputElement>("form[data-behavior='login_form']")!.submit();
  });
}
