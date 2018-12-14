import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;
let open: boolean = false;
let first: boolean = false;

function onLoad() {
  let ipcRenderer = require("electron").ipcRenderer;

  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    //console.log("KEY", key);
    //ipcRenderer.sendToHost("hideLoading");
    //console.log(key);
    login(key);
  });
}
function login(key) {
  if (!first && document.getElementById("signin-email")) {
    //console.log("NAME");
    document.getElementById("signin-email").value = key.username;
    document
      .getElementById("signin-email")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

    document
      .getElementById("signin-email")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

    clickButton(document.querySelector("button[type='submit']"));
    first = true;
    setTimeout(function() {
      login(key);
    }, 50);
  } else if (first && document.getElementById("password") && !open) {
    open = true;
    setTimeout(function() {
      login(key);
    }, 50);
  } else if (first && document.getElementById("password") && open) {
    //console.log("Password2", document.getElementById("password"));

    //console.log("T0");
    //console.log("T1", key);
    document.getElementById("password")!.value = key.password;
    //console.log("T2");
    document
      .getElementById("password")
      .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    //console.log("T3");
    document
      .getElementById("password")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

    clickButton(document.querySelector("button[type='submit']"));
  } else if (document.getElementById("eds-icon--user-chunky_svg")) {
    hideLoading();
  } else {
    //console.log("REPEAT");
    setTimeout(function() {
      login(key);
    }, 50);
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
