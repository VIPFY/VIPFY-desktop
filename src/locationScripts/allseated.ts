import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let logged: boolean | null = true;

function onLoad() {
  if (logged && document.getElementById("input_txti48")) {
    let ipcRenderer = require("electron").ipcRenderer;
    //ipcRenderer.sendToHost("hideLoading");

    ipcRenderer.sendToHost("getLoginData", 7);
    ipcRenderer.on("loginData", (e, key) => {
      console.log("KEY", key);
      let username = key.username;
      let password = key.password;

      document.getElementById("input_txti45")!.value = username;

      document
        .getElementById("input_txti45")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("input_txti45")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      document.getElementById("input_txti48")!.value = password;

      document
        .getElementById("input_txti48")
        .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

      document
        .getElementById("input_txti48")
        .dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));

      clickButton(document.getElementById("login_btn26"));
      logged = false;
      setTimeout(onLoad, 50);
    });
  } else if (document.getElementById("occasionsList_list154")) {
    hideLoading();
  } else {
    setTimeout(onLoad, 50);
  }
}

function onReady() {
  //setInterval(modifyAll, 100);
}

function hideLoading() {
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("hideLoading");
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
