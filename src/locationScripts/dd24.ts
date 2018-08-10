import { ipcRenderer } from "electron";
import {
  con,
  todoPath,
  hideByQuery,
  redirectLinks,
  redirectLinksByQuery,
  deleteElement
} from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

//TODO: Change Links to template Strings with proper domains

function onLoad() {
  if (window.location.pathname == "/login") {
    login();
  }
}

function login() {
  ipcRenderer.sendToHost("getLoginData", 11);
  ipcRenderer.on("loginData", function(e, key) {
    // let email = key.cid;
    // let password = key.password;
    let email = "pascal.clanget@googlemail.com";
    let password = "Xtx6bKg3f7RSmG4usRAxLG3YuFszU";
    document.querySelector<HTMLInputElement>("input[name='_username']")!.value = email;
    document.querySelector<HTMLInputElement>("input[name='_password']")!.value = password;
    document.querySelector<HTMLInputElement>("button[type='submit']")!.click();
  });
}

function onReady() {
  const { pathname } = window.location;
  deleteElement("div#sidebar-wrapper");
  deleteElement("ul.nav.navbar-nav");
  console.log(window.location.pathname);
  ipcRenderer.sendToHost("getCustomerData", 11);
  ipcRenderer.on("customerData", function(e, data) {
    if (
      !(
        pathname.includes("/domain/config") ||
        pathname == "/login" ||
        pathname == "/account/settings/language"
      )
    ) {
      window.location =
        "https://login.domaindiscount24.com/domain/config/dnssettings/domain/gh05d.de";
    }
    document.querySelector("div#mainwrapper").style.paddingLeft = "0";
    document.querySelector("span.visible-md-inline.visible-lg-inline.visible-xl-inline").innerHTML =
      data.name;
    deleteElement("a[href='/account/resetpw']");
    deleteElement("a[href='/account/paymentmethods']");
    const annoyingElement = document.querySelectorAll("ul.dropdown-menu")[10].children[4];
    annoyingElement.parentNode.removeChild(annoyingElement);
    deleteElement("a[href='/logout']");
    deleteElement("a[href='/account/settings/userdata']");

    if (window.location.pathname.includes("/domain/config/general/domain/gh05d.de")) {
      const fields = document.querySelectorAll("div.col-md-12");

      fields[0].parentNode.removeChild(fields[0]);
      fields[2].parentNode.removeChild(fields[2]);

      fields[1].childNodes[1].childNodes[3].style.display = "block";
      fields[1].childNodes[1].removeChild(fields[1].childNodes[1].childNodes[1]);

      //TODO: Change to Vipfy Weiterleitung
      deleteElement("a[href='/domain/requestauthcode/gh05d.de']");
      deleteElement("a[href='/domain/push/gh05d.de']");
    }
  });

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

function modifyAll() {
  //the following two should apply equally to most instances, but there are occasional exceptions
  // redirectLinks("#dialog/tier-plan-standalone", todoPath);
  // redirectLinksByQuery("a.tierChangeStandaloneModal", todoPath);
  //
  // hideByQuery("#email", true);
  // hideByQuery('a[href="#password"]', true);
  // hideByQuery('a[href="/settings/billing"]', true);
  // hideByQuery('a[href="/settings/change_billing"]', true);
  // hideByQuery('a[href="https://vipfy-test.pipedrive.com/users/add"]', false);
  // hideByQuery('input[name="user[email]"]', true);
  // hideByQuery('a[href="/settings/sso"]', true);
}
