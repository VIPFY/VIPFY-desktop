import { con, todoPath, hideByQuery, redirectLinks, redirectLinksByQuery } from "./utils/util";

module.exports = function() {
  //window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};


function onLoad() {
  con.log("Location: ", window.location.host);
  if (window.location.host === "accounts.google.com") {
    login();
  }
}

function login() {
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 5);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.email;
    let password = key.password;

    con.log("Pathname ", window.location.pathname)
    if(window.location.pathname === "/signin/v2/identifier") {
      setTimeout(() => enterIdentifier(email, password), 5000);
    } else if (window.location.pathname === "/ServiceLogin") {
      setTimeout(() => enterEmail(email, password), 5000);
    } else if (window.location.pathname === "/signin/v2/sl/pwd") {
      enterPassword(email, password);
    } else if(document.getElementById("Passwd")) {
      enterOtherPassword(email, password);
    }
  });
}

function enterEmail(email, password) {
  con.log("entering email");
  document.querySelector<HTMLInputElement>("input[name='Email']")!.value = email;
  clickButton(document.getElementById("next")!);

  waitForPasswordField(email, password);
}

function enterIdentifier(email, password) {
  con.log("entering identifier");
  document.querySelector<HTMLInputElement>("input[name='identifier']")!.value = email;
  clickButton(document.getElementById("identifierNext")!);

  waitForPasswordField(email, password);
}

function waitForPasswordField(email, password) {
  if(window.location.pathname === "/signin/v2/sl/pwd") {
    enterPassword(email, password);
  } else if(document.getElementById("Passwd")) {
    enterOtherPassword(email, password);
  } else {
    setTimeout(() => waitForPasswordField(email, password), 100);
  }
}

function enterPassword(email, password) {
  con.log("entering password");
  document.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
  clickButton(document.getElementById("passwordNext")!);
}

function enterOtherPassword(email, password) {
  con.log("entering other password");
  document.querySelector<HTMLInputElement>("input[name='Passwd']")!.value = password;
  clickButton(document.getElementById("signIn")!);
}

function clickButton(targetNode: HTMLElement): void {
  triggerMouseEvent (targetNode, "mouseover");
  setTimeout(() => {
    triggerMouseEvent (targetNode, "mousedown");
    setTimeout(() => {
      triggerMouseEvent (targetNode, "mouseup");
      triggerMouseEvent (targetNode, "click");
    }, 77);
  }, 146);
}

function triggerMouseEvent(node: HTMLElement, eventType: string): void {
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent (eventType, true, true);
  node.dispatchEvent (clickEvent);
}