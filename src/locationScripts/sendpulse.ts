import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
let open: boolean = false;

function onLoad() {
  if (!open && document.getElementsByClassName("dropdown-toggle btn btn-login")[0]) {
    clickButton(document.getElementsByClassName("dropdown-toggle btn btn-login")[0]);
    open = true;
    setTimeout(onLoad, 50);
  } else if (open && document.getElementsByClassName("dropdown-toggle btn btn-login")[0]) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;
      document.querySelector("input[name='login']").value = username;
      document
        .querySelector("input[name='login']")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .querySelector("input[name='login']")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.querySelector("input[name='password']").value = password;
      document
        .querySelector("input[name='password']")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .querySelector("input[name='password']")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      clickButton(document.querySelector("button[type='submit']"));
    });
  } else if (document.getElementById("side-menu")) {
    hideLoading();
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  if (document.getElementById("password")) {
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