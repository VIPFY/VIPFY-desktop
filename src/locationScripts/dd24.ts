import { ipcRenderer } from "electron";
import { deleteElement } from "./utils/util";

module.exports = function() {
  window.addEventListener("DOMContentLoaded", onReady);
  window.addEventListener("load", onLoad);
};

const { pathname } = window.location;

function onLoad() {
  if (pathname == "/login") {
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

/*
 * Delete Warenkorb, Account Settings, Logout, redirect from any routes the customer
 * shouldn't see and also redirect several buttons like transfer and renewal
 */
function onReady() {
  document.querySelector("div#mainwrapper").style.paddingLeft = "0";

  // Remove the link from the dd24 logo
  const dummyLogo = document.createElement("div");
  dummyLogo.className = "navbar-brand";
  document.querySelector("div.navbar-header").appendChild(dummyLogo);

  const elementsToRemove = [
    "a.navbar-brand[href='/']",
    "div#sidebar-wrapper",
    "ul.nav.navbar-nav",
    "a[href='/cart/show']"
  ];
  elementsToRemove.forEach(element => deleteElement(element));

  ipcRenderer.sendToHost("getCustomerData", 11);
  ipcRenderer.on("customerData", function(e, data) {
    // TODO: Replace with data.domain
    const domain = "gh05d.de";
    if (
      !(
        pathname.includes("/domain/config") ||
        pathname == "/login" ||
        pathname == "/account/settings/language"
      ) ||
      pathname == `/domain/requestauthcode/${domain}`
    ) {
      window.location = `https://login.domaindiscount24.com/domain/config/dnssettings/domain/${domain}`;
    }

    // Exchange the account number of dd24 with the Users company and remove the
    // Menu which contains options to change account settings
    const nameHolder = document.querySelector("li.dropdown:last-child");
    nameHolder.removeChild(nameHolder.children[1]);
    nameHolder.children[0].children[1].innerHTML = data.name;
    nameHolder.children[0].style = "cursor: default";
    nameHolder.children[0].href = "";
    nameHolder.children[0].class = "";

    if (pathname.includes(`/domain/config/general/domain/${domain}`)) {
      const fields = document.querySelectorAll("div.col-md-12");

      fields[0].parentNode.removeChild(fields[0]);
      fields[2].parentNode.removeChild(fields[2]);

      fields[1].childNodes[1].childNodes[3].style.display = "block";
      fields[1].childNodes[1].removeChild(fields[1].childNodes[1].childNodes[1]);

      // Workaround because the notification doesn't properly show at the moment
      const daddies = document.querySelectorAll(
        "div.form-group.has-feedback.text-center.inputhelper"
      );
      daddies[0].dataset.openinmodal = 1;
      daddies[0].dataset.modalclass = "flexible";
      daddies[0].onclick = function() {
        document.querySelector("div.modal-loading.clearfix").innerHTML =
          "The authcode for the domain was sent to your email address";
        document.querySelector("h1.modal-title").innerHTML = domain;
      };
    }
  });
}
