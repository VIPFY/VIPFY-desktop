import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  if (document.location.host === "www.teamwork.com") {
    console.log("Beginning");
    document.location = "https://vipfy.teamwork.com/launchpad/login/projects";
  }

  //let loginForm = document.getElementById("loginForm");
  //let loginUser = document.getElementById("username");
  //let loginPass = document.getElementById("IDToken2");

  /*console.log(loginForm);
  if (loginUser) {
    loginUsername(loginForm);
  }
  if (loginPass) {
    loginPwd();
  }*/
}

function onReady() {
  if (document.location.host === "vipfy.teamwork.com") {
    console.log("ProjectPage");
    //LOGIN
    login();
  }
}

function modifyAll() {}

function modifySettings() {}

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

      //document.getElementById("loginemail").value = username;
      //document.getElementById("loginpassword").value = password;

      triggerEvent(document.getElementById("loginemail"), "focus");

      //document.getElementById("loginemail").value = username;
      triggerEvent(document.getElementById("loginemail"), "keydown");
      //triggerEvent(document.getElementById("loginemail"), "keypress(e)");
      document
        .getElementById("loginemail")
        .dispatchEvent(new KeyboardEvent("keypress", { key: "a" }));
      triggerEvent(document.getElementById("loginemail"), "keyup");

      triggerEvent(document.getElementById("loginpassword"), "focus");
      triggerEvent(document.getElementById("loginpassword"), "keydown");
      document.getElementById("loginpassword").value = password;
      triggerEvent(document.getElementById("loginpassword"), "keyup");

      /*let event = document.createEvent("Event");
      event.initEvent("keypress", true, true);
      event.keyCode = 76;
      document.getElementById("loginemail").dispatchEvent(event);*/

      //document.querySelectorAll("button[type='submit']")[0].click();

      //clickButton(document.getElementById("signIn")!);
    });
  } else {
    console.log("Try again");
    setTimeout(login, 100);
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
