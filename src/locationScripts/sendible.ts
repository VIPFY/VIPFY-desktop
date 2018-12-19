import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  if (document.getElementById("login-inputPassword")) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("login-inputEmail")!.value = username;

      document
        .getElementById("login-inputEmail")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("login-inputEmail")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.getElementById("login-inputPassword")!.value = password;

      document
        .getElementById("login-inputPassword")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("login-inputPassword")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      clickButton(document.getElementById("login-submit"));
      hideLoading();
    });
  } else if (document.getElementById("page-holder")) {
    hideLoading();
  } else {
    setTimeout(onLoad, 50);
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.getElementById("login-inputPassword")) {
    setTimeout(hideLoading, 100);
  } else {
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("hideLoading");
  }
}

function modifyAll() {}

function modifySettings() {}

function clickButton(targetNode: HTMLElement): void {
  triggerMouseEvent(targetNode, "mouseover");
  setTimeout(() => {
    triggerMouseEvent(targetNode, "mousedown");
    setTimeout(() => {
      triggerMouseEvent(targetNode, "mouseup");
      triggerMouseEvent(targetNode, "click");
    }, 77);
  }, 146);
}

function triggerMouseEvent(node: HTMLElement, eventType: string): void {
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}
