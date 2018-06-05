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
  con.log(window.location.pathname);

  setInterval(modifyAll, 100);
    /*modifySettings();
    let url = location.href;
    document.body.addEventListener('click', ()=>{
        requestAnimationFrame(()=>{
          url!==location.href&&modifySettings();
          url = location.href;
        });
    }, true);*/
}

function modifyAll() {

  //the following two should apply equally to most instances, but there are occasional exceptions
  /*redirectLinks("#dialog/tier-plan-standalone", todoPath);
  redirectLinksByQuery("a.tierChangeStandaloneModal", todoPath);

  hideByQuery("#email", true);
  hideByQuery('a[href="#password"]', true);
  hideByQuery('a[href="/settings/billing"]', true);
  hideByQuery('a[href="/settings/change_billing"]', true);
  hideByQuery('a[href="https://vipfy-test.pipedrive.com/users/add"]', false);
  hideByQuery('input[name="user[email]"]', true);
  hideByQuery('a[href="/settings/sso"]', true);*/
}



function login() {
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("getLoginLink", 2);
}