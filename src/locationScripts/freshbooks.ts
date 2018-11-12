import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onLoad() {
  if (pathname == "/login/") {
    login();
  }
}

function onReady() {
  console.log("Ready");
}

function login() {
  // change to Appid of Freshbooks
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.username;
    let password = key.password;

    /** edit by pwn
    document.getElementById<HTMLInputElement>("smux_identity_email")!.value = email;
    document.getElementById<HTMLInputElement>("smux_identity_password")!.value = password;
    document.getElementById<HTMLInputElement>("button[name='commit']")!.click();**/

    /** für https://my.freshbooks.com/#/login
    document.getElementById<HTMLInputElement>("ember13")!.value = email;
    document.getElementById<HTMLInputElement>("ember14")!.value = password;
    document.querySelector<HTMLInputElement>('button[class="button-primary large  block "]')!.submit();
    **/

    let form = document.getElementById("login-form");

    console.log(form);

    form.querySelector<HTMLInputElement>("input[name='email']")!.value = email;
    form.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
    form.querySelector<HTMLInputElement>("button[name='submit']")!.click();
  });
}
