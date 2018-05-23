import { con, todoPath, hideByQuery } from "./utils/util";

module.exports = function() {
  if (window.location.pathname == "/account/delete") {
    window.location.replace(todoPath);
    return;
  }

  if (window.location.pathname == "/upgrade") {
    window.location.replace(todoPath);
    return;
  }

  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

function onLoad() {
  let loginForm = document.getElementById("regular-login-forms");
  if (loginForm) {
    login(loginForm);
  }
}

function onReady() {
  con.log(window.location.pathname);
  if (window.location.pathname.startsWith("/account")) {
    setInterval(modifySettings, 100);
    /*modifySettings();
    let url = location.href;
    document.body.addEventListener('click', ()=>{
        requestAnimationFrame(()=>{
          url!==location.href&&modifySettings();
          url = location.href;
        });
    }, true);*/
  }
}

function modifySettings() {
  //con.log("page changed");
  hideByQuery(".preference-email-row", false);
  hideByQuery(".change-password-block", true);
  hideByQuery(".account-tfa-settings", false);
}

function login(form: Element) {
  con.log("filling in dropbox login form");
  form.querySelector<HTMLInputElement>("input[name='login_email']")!.value = "jf@vipfy.com";
  form.querySelector<HTMLInputElement>("input[name='login_password']")!.value = "zdwMYqQPE4gSHr3QQSkm";
  form.querySelector<HTMLInputElement>("input[name='remember_me']")!.checked = true;
  form.querySelector<HTMLInputElement>("button[type='submit']")!.click();
}
