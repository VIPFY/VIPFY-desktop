import { con, todoPath, hideByQuery, redirectLinks } from "./utils/util";

module.exports = function() {
  console.log("MATCH");
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

let loading: boolean | null = true;

function onLoad() {
  let loginForm = document.getElementById("divSignInPage");
  console.log(loginForm);
  if (loginForm) {
    login(loginForm);
  }
}

function onReady() {
  setInterval(modifyAll, 100);
  /*con.log(window.location.pathname);
  if (window.location.pathname.startsWith("/account")) {
    setInterval(modifySettings, 100);
    
  }
  setInterval(modifyAll, 100);*/
}

function modifyAll() {
  let ipcRenderer = require("electron").ipcRenderer;
  if (document.getElementById("divSignInPage")) {
    ipcRenderer.sendToHost("showLoading");
    loading = true;
    return;
  }
  if (loading) {
    ipcRenderer.sendToHost("hideLoading");
    loading = false;
  }
}

function modifySettings() {}

function login(form: Element) {
  console.log("filling in vistaprint login form");
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("hideLoading");

  ipcRenderer.sendToHost("getLoginData", 7);
  ipcRenderer.on("loginData", (e, key) => {
    console.log("KEY", key);
    let username = key.username;
    let password = key.password;

    form.querySelector<HTMLInputElement>("input[name='txtEmail']")!.value = username;
    form
      .querySelector("input[name='txtEmail']")
      .dispatchEvent(new Event("keydown", { bubbles: true, cancelable: true }));
    form.querySelector<HTMLInputElement>("input[name='txtSignInPassword']")!.value = password;
    form
      .querySelector("input[name='txtSignInPassword']")
      .dispatchEvent(new Event("keydown", { bubbles: true, cancelable: true }));
    //form.querySelector<HTMLInputElement>("input[name='chkRememberMe']")!.checked = true;
    form.querySelector("input[name='chkRememberMe']").click();
    form.querySelector("input[name='btnSignIn']").click();
  });
}

/*
<span class="textbutton-old-with-submit textbutton textbutton-old textbutton-skin-emphasis"

onclick="

if($('#rblPasswordQuestion_0:checked').val() != null ) { 
  
  $('#btnSignUp').click();
  $('#btnSignUp input').click();
  return false; }
  
  needToConfirm = false;
  document.getElementById('txtEmail').disabled=false;
  try {
    formInteraction('SignIn');
  }
  catch(e){}"
  
  id="btnSignIn" tabindex="4" style="min-width:110px;"><input class="textbutton-inner-submit" type="image" name="btnSignIn"><span class="textbutton-inner">Sign In</span></span>*/
