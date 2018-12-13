import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  if (document.querySelector("input[name='password']")) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.querySelector("input[name='username']")!.value = username;

      document
        .querySelector("input[name='username']")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .querySelector("input[name='username']")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.querySelector("input[name='password']")!.value = password;

      document
        .querySelector("input[name='password']")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .querySelector("input[name='password']")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      clickButton(document.querySelector("button[type='submit']"));
    });
  } else {
    setTimeout(onLoad, 50);
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.querySelector("input[name='password']")) {
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
