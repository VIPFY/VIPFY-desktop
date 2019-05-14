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

console.log("starting find Password");
ipcRenderer.sendToHost("loaded", null);

let done = false;
function doit(force) {
  if (done) return;
  const password = getQueryString(findPassField());
  const button = getQueryString(findConfirmButton());
  console.log("doit", password, button);
  if (force || (password !== null && button !== null)) {
    done = true;
    console.log("sending data");
    ipcRenderer.sendToHost("passwordobject", password);
    ipcRenderer.sendToHost("confirmbutton", button);
  }
}

ipcRenderer.on("loginData", (e, key) => {
  console.log("login", key);

  const { username, usernameField, button1 } = key;

  waitForObject(usernameField, 10000, () => {
    console.log("filling form", usernameField, username, button1);
    fillFormField(document.querySelector(usernameField), username);
    clickButton(document.querySelector(button1));

    // try at various times in case the page takes a while to load
    setTimeout(function() {
      doit(false);
    }, 500);
    setTimeout(function() {
      doit(false);
    }, 1500);
    setTimeout(function() {
      doit(false);
    }, 3000);
    setTimeout(function() {
      doit(false);
    }, 5000);
    setTimeout(function() {
      doit(false);
    }, 10000);
    setTimeout(function() {
      doit(true);
    }, 15000);
  });
});
ipcRenderer.sendToHost("getLoginDetails", null);

function waitForObject(s, timeout, callback) {
  console.log("waitForObject", s, document.querySelector(s), timeout);
  if (document.querySelector(s) !== null) {
    return callback();
  }

  if (timeout < 0) {
    return callback();
  }

  setTimeout(() => waitForObject(s, timeout - 500, callback), 500);
}

const queryStringBlacklist = ["_ngcontent", "_nghost"];

function getQueryString(t) {
  console.log("I am starting");
  if (t === null || t === undefined) return null;
  if (t.id) {
    return `[id="${t.id}"]`; // don't use #id because that fails with ids containing colons (:)
  } else if (t.name && t.tagName) {
    return `${t.tagName.toLowerCase()}[name="${t.name}"]`;
  } else if (t.tagName.toLowerCase() == "input" || t.tagName.toLowerCase() == "button") {
    let s = t.tagName.toLowerCase();
    console.log("I am here");
    console.log(t.attributes);
    if (t.attributes["type"]) {
      s += '[type="';
      s += t.attributes["type"].value ? t.attributes["type"].value : t.attributes["type"];
      s += '"]';
    }
    if (document.querySelectorAll(s).length == 1) {
      return s;
    }
    if (t.className) {
      s += Array.from(t.classList)
        .map(v => (v.includesAny(queryStringBlacklist) ? null : "[class~=" + v + "]"))
        .filter(v => v !== null)
        .join("");
    }
    return s;
  } else if (t.attributes["role"]) {
    let s = `${t.tagName.toLowerCase()}[role="${t.attributes["role"].value}"]`;
    if (t.className) {
      s += Array.from(t.classList)
        .map(v => (v.includesAny(queryStringBlacklist) ? null : "[class~=" + v + "]"))
        .filter(v => v !== null)
        .join("");
    }
    return s;
  }
  console.log("don't know how to construct query string for element", t);
  return null;
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
  "alt"
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

function fillFormField(target, content) {
  target.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
  target.value = content;
  target.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  target.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
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
  const clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}
