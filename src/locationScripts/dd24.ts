import { con, todoPath, hideByQuery, redirectLinks, redirectLinksByQuery } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  if (window.location.pathname == "/login") {
    login();
  }
}

function onReady() {
  console.log(window.location.pathname);

  // setInterval(modifyAll, 100);
  /*modifySettings();
    let url = location.href;
    document.body.addEventListener('click', ()=>{
        requestAnimationFrame(()=>{
          url!==location.href&&modifySettings();
          url = location.href;
        });
    }, true);*/
}

function login() {
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    let email = key.cid;
    let password = key.password;
    document.querySelector<HTMLInputElement>("input[name='_username']")!.value = email;
    document.querySelector<HTMLInputElement>("input[name='_password']")!.value = password;
    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
}
