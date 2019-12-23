const { ipcRenderer } = require("electron");
const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms / speed));

window.addEventListener("load", onLoad);

function hideNodes(nodes) {
  nodes.forEach(node => (node.style.display = "none"));
}

function onLoad() {
  if (window.location.pathname != "/support/tickets/new") {
    ipcRenderer.sendToHost("form-submit");
  }

  ipcRenderer.sendToHost("get-email");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const navigation = document.querySelector("nav.page-tabs");
  const copyright = document.querySelector(".copyright");
  const cancelButton = document.querySelector("a.btn[href='/support/home']");

  const emailWrapper = document.querySelector(".control-group");
  const emailField = document.getElementById("helpdesk_ticket_email");

  ipcRenderer.on("email", async (e, email) => {
    hideNodes([header, footer, navigation, copyright, cancelButton]);

    emailField.value = email;
    emailWrapper.style.height = 0;
    emailWrapper.style.opacity = 0;
    emailWrapper.style.position = "absolute";
    emailWrapper.style.left = 0;
    emailWrapper.style.top = 0;

    ipcRenderer.sendToHost("loading-finished");
  });
}
