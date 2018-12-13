import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  //let loginForm = document.getElementById("login_form");
  //console.log(loginForm);
  //if (loginForm) {
  //  login(loginForm);
  //}

  login();

  //hideLoading();
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function login() {
  if (loading && document.getElementsByClassName("email")[0]) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementsByClassName("email")[0].children[0]!.value = username;

      document
        .getElementsByClassName("email")[0]
        .children[0].dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementsByClassName("email")[0]
        .children[0].dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.getElementsByClassName("password")[0].children[0]!.value = password;
      document
        .getElementsByClassName("password")[0]
        .children[0].dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      document
        .getElementsByClassName("password")[0]
        .children[0].dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      clickButton(
        document.getElementsByClassName(
          "attr-ion-button button button-md button-outline button-outline-md button-default button-default-md"
        )[0]
      );
    });
    loading = false;
  } else if (!loading && !document.getElementsByClassName("email")[0]) {
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("hideLoading");
    return;
  }
  setTimeout(login, 100);
}

function hideLoading() {
  if (document.getElementById("signinemail")) {
    setTimeout(hideLoading, 100);
  } else {
    let ipcRenderer = require("electron").ipcRenderer;
    ipcRenderer.sendToHost("hideLoading");
  }
}

function modifyAll() {}

function modifySettings() {}

/*function login(form: Element) {
  console.log("filling in meraki login form");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    form.querySelector<HTMLInputElement>("input[name='email']")!.value = username;
    form.querySelector<HTMLInputElement>("input[name='password']")!.value = password;
    form.querySelector<HTMLInputElement>("input[name='remember_user']")!.checked = true;
    form.querySelector<HTMLInputElement>("input[name='commit']")!.click();
  });
}
*/
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
