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

Object.defineProperty(String.prototype, "includesAnyRegExp", {
  value: function(searches) {
    for (const search of searches) {
      if (search.test(this)) {
        return true;
      }
    }
    return false;
  }
});

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms / speed));
};

let interactionHappened = false;
function didInteraction() {
  interactionHappened = true;
}
function timer() {
  if (!interactionHappened) {
    return;
  }
  interactionHappened = false;
  ipcRenderer.sendToHost("interactionHappened");
}

document.addEventListener("mousemove", didInteraction, true);
document.addEventListener("touchmove", didInteraction, true);
document.addEventListener("touchenter", didInteraction, true);
document.addEventListener("pointermove", didInteraction, true);
document.addEventListener("keydown", didInteraction, true);
document.addEventListener("scroll", didInteraction, true);

setInterval(() => timer(), 30000);
setTimeout(() => timer(), 5000);

let emailEntered = false;
let passwordEntered = false;
let stopped = false;
let speed = 1;

ipcRenderer.once("loginData", async (e, key) => {
  console.log("LOGIN DATA WEBSEITE", stopped, emailEntered, passwordEntered);
  if (stopped) return;
  emailEntered = key.emailEntered;
  passwordEntered = key.passwordEntered;
  speed = key.speed || 1;
  let didAnything = false;
  while (!emailEntered || !passwordEntered || stopped) {
    console.log("LOGIN DATA", !emailEntered, !passwordEntered, stopped);
    await sleep(100);
    let totaltime = 100;
    let email = findEmailField();
    let password = findPassField();
    let button = findConfirmButton();
    let cookiebutton = findCookieButton();
    let recaptcha;
    didAnything = false;
    while (totaltime < 5000) {
      if (email || emailEntered || cookiebutton) break;
      await sleep(300);
      totaltime += 300;
      email = findEmailField();
      cookiebutton = findCookieButton();
    }
    await sleep(500);
    if (cookiebutton) {
      await clickButton(cookiebutton);
    }
    email = findEmailField();
    console.log("EMAIL FOUND", email, !emailEntered);
    if (email && !emailEntered) {
      await clickButton(email);
      console.log("FILL EMAIL");
      await fillFormField(email, "username");
      console.log("did Email", email);
      emailEntered = true;
      didAnything = true;
    }
    await sleep(100);
    recaptcha = findForm().querySelector('iframe[src*="/recaptcha/"]');
    console.log("FIND recaptcha", findForm(), recaptcha);
    if (recaptcha && (recaptcha.scrollHeight != 0 || recaptcha.scrollWidth != 0)) {
      ipcRenderer.sendToHost("recaptcha", null);
    }
    password = findPassField();
    if (password && !passwordEntered) {
      await clickButton(password);
      await fillFormField(password, "password");
      passwordEntered = true;
      console.log("did Password");
      didAnything = true;
    }
    button = findConfirmButton();
    console.log("Button Check", button, didAnything);
    if (button && didAnything) {
      await clickButton(button);
      console.log("did Button");
      didAnything = true;
    }
    await sleep(4000);
  }
  if (emailEntered && passwordEntered && !stopped) {
    recaptcha = findForm().querySelector('iframe[src*="/recaptcha/"]');
    console.log("FIND recaptcha 2", findForm(), recaptcha);
    if (recaptcha && (recaptcha.scrollHeight != 0 || recaptcha.scrollWidth != 0)) {
      ipcRenderer.sendToHost("recaptcha", null);
    } else {
      // Special Case for Wrike
      console.log("SPEZIAL");
      clickButton(document.querySelector("[wrike-button-v2][data-application='login-remember']"));
    }
  }
});

function start() {
  //if (!document.body.id.includes("beacon")) {
  ipcRenderer.sendToHost("loaded", null);
  ipcRenderer.sendToHost("getLoginData", null);
  //}
}

start();
/*
if (document.readyState === "complete") {
  start();
} else {
  window.addEventListener("DOMContentLoaded", start, false);
}*/

async function fillFormField(target, content) {
  //console.log("FILL", target, content);
  if (stopped) throw new Error("abort");
  //target.focus();
  // await sleep(250);
  // target.focus();
  //  await sleep(250);
  const p = new Promise(resolve =>
    ipcRenderer.once("formFieldFilled", async (e, key) => {
      if (stopped) return;
      resolve();
    })
  );
  ipcRenderer.sendToHost("fillFormField", content);
  return p;
}

window.addEventListener("beforeunload", () => {
  stopped = true;
  ipcRenderer.sendToHost("unload", null);
});

function isHidden(elem) {
  if (!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)) return true;
  const style = window.getComputedStyle(elem);
  if (style.display === "none" || style.opacity === 0 || style.visibility === "hidden") return true;
  const pos = getMidPoint(elem);
  const e = document.elementFromPoint(pos.x, pos.y);
  return !isEqualOrChild(e, elem);
}

function isEqualOrChild(child, parent) {
  if (child == parent) return true;
  if (child === null || parent === null) return false;
  while (child.parentElement !== null) {
    child = child.parentElement;
    if (child == parent) return true;
  }
  return false;
}

function getMidPoint(e) {
  var rect = e.getBoundingClientRect();
  return { x: rect.x + rect.width / 10, y: rect.y + rect.height / 2 }; // bias to the left
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

function findForm(ignoreForm) {
  if (ignoreForm) return document;
  let forms = Array.from(document.querySelectorAll("form")).filter(
    filterDom(["sign.?in", "log.?in"], ["oauth", "facebook", "sign.?up", "forgot", "google"])
  );

  if (forms.length == 0) {
    forms = Array.from(document.querySelectorAll("form"))
      .filter(filterDom([], ["oauth", "facebook", "sign.?up", "forgot", "google"]))
      .filter(
        e =>
          Array.from(e.querySelectorAll("input")).filter(
            filterDom(["email", "user", "log.?in", "name", "pw", "pass"], [])
          ).length > 0
      );
  }

  return forms.length == 1 ? forms[0] : document;
}

function findPassField() {
  let t = Array.from(findForm().querySelectorAll("input[type=password]"))
    .filter(filterDom(["pass", "pw"], ["repeat", "confirm", "forgot"]))
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("input[type=password]"))
      .filter(filterDom([], ["repeat", "confirm", "forgot"]))
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  return t[0];
}

function findEmailField() {
  let t = Array.from(findForm().querySelectorAll("input"))
    .filter(filterDom(["email", "user", "log.?in", "name"], ["pw", "pass"]))
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("input[type=email]"))
      .filter(filterDom([], ["pw", "pass"]))
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  console.log("EMAIL", t);
  return t[0];
}

function findConfirmButton(ignoreForm) {
  var t = [];
  if (findForm() != document) {
    t = Array.from(findForm().querySelectorAll("[type='submit']"))
      .filter(filterDom([], ["oauth", "google", "facebook", "forgot", "newsletter"]))
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm(ignoreForm).querySelectorAll(
        "a, button, input[type='button'], [role='button'], [class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          ["sign.?in", "log.?in", "submit", "next", "cont(?![a-hj-z])"],
          ["oauth", "google", "facebook", "linkedin", "forgot", "newsletter", "sign.?up"]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm(ignoreForm).querySelectorAll(
        "a, button, input[type='button'], [role='button'], [class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          ["agree", "proceed", "accept"],
          ["oauth", "google", "facebook", "linkedin", "forgot", "newsletter", "sign.?up"]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm().querySelectorAll(
        "button, input[type='button'], [role='button'], [class~='btn-success']"
      )
    )
      .filter(
        filterDom(
          [],
          ["oauth", "google", "facebook", "linkedin", "forgot", "newsletter", "sign.?up"]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm().querySelectorAll(
        "[class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          [],
          ["oauth", "google", "facebook", "linkedin", "forgot", "newsletter", "sign.?up"]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }

  if (t.length == 0 && !ignoreForm) return findConfirmButton(true);

  return t[0];
}

function findCookieButton() {
  var t = Array.from(
    document.querySelectorAll(
      "[class~=cc-compliance] > [class~=cc-dismiss], [class~='consent'] > a[class~='call']"
    )
  )
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  if (t.length == 0) {
    var trustArc = document.querySelector("[src*='https://consent-pref.trustarc.com/']");
    if (trustArc) {
      t = Array.from(
        trustArc.contentWindow.document.querySelectorAll("[class~=call], [role='button']")
      );
    }
  }
  if (t.length == 0) {
    t = Array.from(
      document.querySelectorAll(
        "button, input[type='button'], [role='button'], [class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          ["dismiss", "cookie", "consent"],
          ["oauth", "google", "facebook", "linkedin", "forgot", "newsletter"]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  return t[0];
}

// 168/255
// 80/119 110/119 107/119
const attributes = [
  "name",
  "id",
  "aria-label",
  "aria-roledescription",
  "placeholder",
  "ng-model",
  "data-ng-model",
  "data-callback",
  "data-name",
  "class",
  "value",
  "alt",
  "data-testid",
  "href",
  "data-event-click-target"
];

function filterDom(includesAny, excludesAll) {
  includesAny = includesAny.map(i => new RegExp(i));
  excludesAll = excludesAll.map(i => new RegExp(i));
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
      if (val.includesAnyRegExp(excludesAll)) {
        return false;
      }
    }
    for (const attribute of attributes) {
      const attr = element.attributes.getNamedItem(attribute);
      if (attr === null) continue;
      const val = attr.value.toLowerCase();
      if (val.includesAnyRegExp(includesAny)) {
        return true;
      }
    }
    if (includesAny.length == 0) return true;
    return false;
  };
}
