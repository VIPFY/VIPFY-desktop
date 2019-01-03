import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  if (document.getElementById("user_password")) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("user_login")!.value = username;

      document
        .getElementById("user_login")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("user_login")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.getElementById("user_password")!.value = password;

      document
        .getElementById("user_password")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("user_password")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      clickButton(document.querySelector("input[type='submit']"));
    });
  } else {
    hideLoading();
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.getElementById("user_password")) {
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
