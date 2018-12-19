import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
let first: boolean = false;

function onLoad() {
  if (!first && document.getElementById("Password")) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");
    console.log("Felder");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("Email")!.value = username;

      document
        .getElementById("Email")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("Email")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.getElementById("Password")!.value = password;

      document
        .getElementById("Password")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("Password")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      first = true;
      setTimeout(onLoad, 50);
    });
  } else if (first && document.getElementById("Password")) {
    console.log("Click");
    document.querySelector("form[action='/Account/LogOn']").submit();
    hideLoading();
  } else {
    console.log("Hide");
    hideLoading();
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.getElementById("Password")) {
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
