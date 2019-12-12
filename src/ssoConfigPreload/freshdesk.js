const { ipcRenderer } = require("electron");
const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms / speed));

window.addEventListener("load", onLoad);

function onLoad() {
  if (window.location.pathname != "/support/tickets/new") {
    ipcRenderer.sendToHost("form-submit");
  }

  ipcRenderer.sendToHost("get-email");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const copyright = document.querySelector(".copyright");
  const navigation = document.querySelector("nav.page-tabs");

  const emailWrapper = document.querySelector(".control-group");
  const emailField = document.getElementById("helpdesk_ticket_email");

  ipcRenderer.on("email", async (e, email) => {
    header.style.display = "none";
    footer.style.display = "none";
    navigation.style.display = "none";
    copyright.style.display = "none";

    emailField.value = email;
    emailWrapper.style.height = 0;
    emailWrapper.style.opacity = 0;
    emailWrapper.style.position = "absolute";
    emailWrapper.style.left = 0;
    emailWrapper.style.top = 0;

    ipcRenderer.sendToHost("loading-finished");
  });
}
