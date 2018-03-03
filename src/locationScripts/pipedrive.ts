import { con, todoPath, hideByQuery } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  if (window.location.pathname == "/auth/login") {
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
  //con.log("page changed");
  hideByQuery("#email", true);
  hideByQuery('a[href="#password"]', true);
  hideByQuery('a[href="/settings/billing"]', true);
  hideByQuery('a[data-tracking-component-code="upgradePlan_link"]', true);
  hideByQuery('a[href="https://vipfy-test.pipedrive.com/users/add"]', false);
  hideByQuery('input[name="user[email]"]', true);
  hideByQuery('a[href="/settings/sso"]', true);
  hideByQuery('a[data-tracking="upgradePlan_link"]', false);
}

function login() {
  document.querySelector("input[name='login']")!.value = "jf@vipfy.com";
  document.querySelector("input[name='password']")!.value = "ejHawIX4nWQmj6csB7TZ";
  document.querySelector("input[name='remember']")!.checked = "checked";
  document.querySelector("button[type='submit']")!.click();
}