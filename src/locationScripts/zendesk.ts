import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("ZENDESK");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  console.log("Load");
  //if (document.location.host === "www.teamwork.com") {
  //  console.log("Beginning");
  //  document.location = "https://vipfy.teamwork.com/launchpad/login/projects";
  //}
  login();
}

function onReady() {
  console.log("Ready");
  //if (document.location.host === "vipfy.teamwork.com") {
  //TODO different projects
  console.log("ProjectPage");
  //LOGIN
  //login();
  //}
}

function modifyAll() {}

function modifySettings() {}

function login() {
  console.log(
    document.getElementById("login-form"),
    document.getElementById("user_email"),
    document.getElementById("user_password"),
    document.querySelectorAll("input[type='submit']")[0]
  );
  if (
    document.getElementById("user_email") &&
    document.getElementById("user_password") &&
    document.querySelectorAll("input[type='submit']")[0]
  ) {
    console.log("filling in webex login form password");
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.once("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("user_email").value = username;
      document
        .getElementById("user_email")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      document.getElementById("user_password").value = password;
      document
        .getElementById("user_password")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      document.getElementById("remember_me").click();

      document.querySelectorAll("input[type='submit']")[0].click();
    });
  } else {
    setTimeout(login, 100);
  }
}

function clickSubmit() {
  if (document.getElementsByClassName("button primary").length > 0) {
    console.log("KF");
    document.getElementsByClassName("button primary")[0].click();
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
