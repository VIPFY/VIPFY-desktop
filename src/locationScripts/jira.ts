import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH JIRA");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  console.log("LOAD", document.location);
  if (document.location.host === "id.atlassian.com") {
    console.log("Beginning");
    //setemail();
  }
}

function onReady() {
  console.log("READY", document.location);
  if (document.location.host === "id.atlassian.com") {
    console.log("Ready");
    if (document.getElementsByClassName("password-field")[0].className.includes("hidden")) {
      //setemail();
    } else {
      setpw();
    }
  }
}

function modifyAll() {}

function modifySettings() {}

function setemail() {
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    document.getElementById("username").value = username;
    /*document
        .getElementById("username")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
*/
    document.getElementById("login-submit").click();
  });
}
function setpw() {
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;
    document.getElementById("password").value = password;
    document
      .getElementById("password")
      .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

    document.getElementById("login-submit").click();
  });
}
function login() {
  if (
    document.getElementById("loginemail") &&
    document.getElementById("loginpassword") &&
    document.querySelectorAll("button[type='submit']")[0]
  ) {
    console.log("filling in webex login form password");
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("loginemail").value = username;
      document
        .getElementById("loginemail")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      document.getElementById("loginpassword").value = password;
      document
        .getElementById("loginpassword")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      document.getElementById("rememberMe").click();

      clickSubmit();
    });
  } else {
    console.log("Try again");
    setTimeout(login, 100);
  }
}

function clickSubmit() {
  if (document.getElementsByClassName("w-button w-button--green").length > 0) {
    console.log("KF");
    document.getElementsByClassName("w-button w-button--green")[0].click();
  } else {
    console.log("K");
    setTimeout(login, 50);
  }
}

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

function triggerEvent(el, type) {
  console.log("TRIIGER", el, type);
  if ("createEvent" in document) {
    // modern browsers, IE9+
    let e = document.createEvent("HTMLEvents");
    //e.initEvent(type, false, true);
    //el.dispatchEvent(e);
    el.dispatchEvent(new KeyboardEvent(type));
  } else {
    // IE 8
    let e = document.createEventObject();
    e.eventType = type;
    el.fireEvent("on" + e.eventType, e);
  }
}

function triggerMouseEvent(node: HTMLElement, eventType: string): void {
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}
