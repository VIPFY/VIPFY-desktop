import { con, todoPath, hideByQuery, redirectLinks, redirectLinksByQuery } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  if (
    window.location.pathname == "/login" ||
    window.location.href.indexOf("atlassian.com") !== -1
  ) {
    login();
  }
}

function onReady() {

  document.querySelectorAll("#upgrade-button")["0"].onmousedown = function(e) {
    e.preventDefault();
    window.location = "vipfy://marketplace/2";
  };

  setInterval(modifyAll, 100);

}

function modifyAll() {

  redirectUpgrade(".Mi4xNS4w36YVA8Z-y-AHr23dzzcTLu_0");
  redirectUpgrade(".js-upgrade-now");
  redirectUpgrade(".upgrade-btn");

}

function redirectUpgrade(whatever: string) {
  let d = document.querySelectorAll("#store-iframe");

  if (d.length>0) {
    let ifd = d[0].contentWindow.document;

    if (ifd.body!=null) {

      let elements = ifd.body.querySelectorAll(whatever);
      for (let i = 0; i < elements.length; i++) {
        elements[i].onmousedown = function(e) {
          e.preventDefault();
          window.location = "vipfy://marketplace/2";
        };
      }
    }
  }
}


function login() {

  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginLink", 2);
}
