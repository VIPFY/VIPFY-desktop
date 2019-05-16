let ipcRenderer = require("electron").ipcRenderer;

Object.defineProperty(String.prototype, "includesAny", {
  value: function(searches) {
    for (const search of searches) {
      if (this.indexOf(search) !== -1) {
        return true;
      }
    }
    return false;
  }
});

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

let emailEntered = false;
let passwordEntered = false;

ipcRenderer.once("loginData", async (e, key) => {
  console.log("gotLoginData", key);
  while (!emailEntered || !passwordEntered) {
    await sleep(100);
    let totaltime = 100;
    let email = findEmailField();
    let password = findPassField();
    let button = findConfirmButton();
    while (totaltime < 15000) {
      if (email || emailEntered) break;
      await sleep(300);
      totaltime += 300;
      email = findEmailField();
    }
    if (email) {
      await fillFormField(email, key.username);
      emailEntered = true;
    }
    await sleep(100);
    password = findPassField();
    if (password) {
      await fillFormField(password, key.password);
      passwordEntered = true;
    }
    button = findConfirmButton();
    if (button) {
      await clickButton(button);
    }
    await sleep(4000);
  }
});

console.log("starting universal login");
ipcRenderer.sendToHost("loaded", null);
ipcRenderer.sendToHost("getLoginData", null);

let done = false;
function doit(force) {
  if (done) return;
  const email = getQueryString(findEmailField());
  const password = getQueryString(findPassField());
  const button = createQueryString(
    findConfirmButton(),
    ["sign", "log", "submit"],
    ["oauth", "google", "facebook", "forgot"]
  );
  if (force || (email !== null && password !== null && button !== null)) {
    done = true;
    ipcRenderer.sendToHost("emailobject", email);
    ipcRenderer.sendToHost("passwordobject", password);
    ipcRenderer.sendToHost("confirmbutton", button);
  }
}

async function fillFormField(target, content) {
  target.focus();
  const p = new Promise(resolve =>
    ipcRenderer.once("formFieldFilled", async (e, key) => {
      resolve();
    })
  );
  ipcRenderer.sendToHost("fillFormField", content);
  return p;
}

function clickButton(targetNode) {
  triggerMouseEvent(targetNode, "mouseover");
  setTimeout(() => {
    triggerMouseEvent(targetNode, "mousedown");
    setTimeout(() => {
      triggerMouseEvent(targetNode, "mouseup");
      triggerMouseEvent(targetNode, "click");
    }, 77);
  }, 146);
}

function triggerMouseEvent(node, eventType) {
  node.focus();
  const clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function findForm() {
  const forms = Array.from(document.querySelectorAll("form")).filter(
    filterDom(["signin", "sign-in", "log"], ["oauth", "facebook", "signup", "forgot", "google"])
  );
  console.log("forms", forms);

  return forms.length == 1 ? forms[0] : document;
}

function findPassField() {
  const t = Array.from(findForm().querySelectorAll("input")).filter(
    filterDom(["pass", "pw"], ["repeat", "confirm", "forgot"])
  );
  console.log("pass", t);
  return t[0];
}

function findEmailField() {
  const t = Array.from(findForm().querySelectorAll("input")).filter(
    filterDom(["email", "user", "login"], ["pw", "pass"])
  );
  console.log("email", t);
  return t[0];
}

function findConfirmButton() {
  var t = Array.from(findForm().querySelectorAll("[type='submit']"));
  if (t.length == 0) {
    t = Array.from(
      findForm().querySelectorAll("button, input[type='button'], [role='button']")
    ).filter(filterDom(["sign", "log", "submit"], ["oauth", "google", "facebook", "forgot"]));
  }
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("button, input[type='button'], [role='button']"));
  }

  return t[0];
}

const attributes = [
  "name",
  "id",
  "aria-label",
  "aria-roledescription",
  "placeholder",
  "ng-model",
  "data-ng-model",
  "data-callback",
  "class",
  "value",
  "alt",
  "data-testid"
];

function filterDom(includesAny, excludesAll) {
  return function(element) {
    if (!element.hasAttributes()) {
      return false;
    }
    if (element.scrollHeight == 0 || element.scrollWidth == 0) {
      return false; //don't select elements that aren't visible
    }
    for (const attribute of attributes) {
      const attr = element.attributes.getNamedItem(attribute);
      if (attr == null) continue;
      const val = attr.value.toLowerCase();
      if (val.includesAny(excludesAll)) {
        return false;
      }
    }
    for (const attribute of attributes) {
      const attr = element.attributes.getNamedItem(attribute);
      if (attr === null) continue;
      const val = attr.value.toLowerCase();
      //console.log("attr", attribute, val, includesAny);
      if (val.includesAny(includesAny)) {
        return true;
      }
    }
    return false;
  };
}
