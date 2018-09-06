import { ipcRenderer } from "electron";

module.exports = function() {
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onLoad() {
  if (pathname == "/login") {
    login();
  }
}

function login() {
  ipcRenderer.sendToHost("getLoginData", 27);
  ipcRenderer.on("loginData", function(e, key) {
    console.log(key);
    const username = key.username;
    const password = key.password;

    document.querySelector<HTMLInputElement>("input[id='usernameContainer-input-id']")!.value = username;
    document.querySelector<HTMLInputElement>("input[id='passwordContainer-input-id']")!.value = password;
    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
}