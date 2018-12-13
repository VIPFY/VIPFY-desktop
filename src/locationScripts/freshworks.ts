import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  if (
    document.querySelector<HTMLInputElement>("input[name='email']") &&
    !document.getElementById("first_name")
  ) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.querySelector<HTMLInputElement>("input[name='email']")!.value = username;

      document
        .querySelector<HTMLInputElement>("input[name='email']")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document.querySelector<HTMLInputElement>("input[name='password']")!.value = password;

      document
        .querySelector<HTMLInputElement>("input[name='password']")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      clickButton(
        document.getElementsByClassName("left btn primary_btn full_length login-button")[0]
      );
    });
  } else if (document.getElementById("first_name")) {
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("hideLoading");
  } else {
    setTimeout(onLoad, 100);
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.querySelector<HTMLInputElement>("input[name='email']")) {
    setTimeout(hideLoading, 50);
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
