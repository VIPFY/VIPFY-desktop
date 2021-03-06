import { ipcRenderer } from "electron";

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

ipcRenderer.sendToHost("loaded", null);

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

const queryStringBlacklist = ["_ngcontent", "_nghost"];

function getQueryString(t) {
  if (t === null || t === undefined) return null;
  if (t.id) {
    return `[id="${t.id}"]`; // don't use #id because that fails with ids containing colons (:)
  } else if (t.name && t.tagName) {
    return `${t.tagName.toLowerCase()}[name="${t.name}"]`;
  } else if (t.tagName.toLowerCase() == "input" || t.tagName.toLowerCase() == "button") {
    let s = t.tagName.toLowerCase();
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

const literalAttributes = ["role", "type", "ng-model", "data-ng-model"];

function createQueryString(t, pro, contra) {
  if (t === null || t === undefined) return null;
  s = t.tagName;
  if (document.querySelectorAll(s).length == 1) return s;
  for (a of literalAttributes) {
    if (t.attributes[a]) {
      const s_old = s;
      s += `[${a}='${t.attributes[a].value}']`;
      const l = document.querySelectorAll(s).length;
      if (l == 1) return s;
      if (l == 0) s = s_old;
    }
  }
  for (a of attributes) {
    for (p of pro) {
      const l_old = document.querySelectorAll(s).length;
      const s_old = s;
      s += `[${a}*='${p}']`;
      const q = document.querySelectorAll(s);
      if (q.length == 0 || !Array.from(q).includes(t)) {
        s = s_old;
        continue;
      }
      if (q.length == 1) return s;
      if (q.length == l_old) {
        //s = s_old;
        //continue;
      }
    }
  }
  for (a of attributes) {
    for (p of contra) {
      const l_old = document.querySelectorAll(s).length;
      const s_old = s;
      s += `:not([${a}*='${p}'])`;
      const q = document.querySelectorAll(s);
      if (q.length == 0 || !Array.from(q).includes(t)) {
        s = s_old;
        continue;
      }
      if (q.length == 1) return s;
      if (q.length == l_old) {
        //s = s_old;
        //continue;
      }
    }
  }
  console.log("unsuccessful", s, document.querySelectorAll(s).length);
  throw new Error("no query selector found");
}

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
      if (val.includesAny(includesAny)) {
        return true;
      }
    }
    return false;
  };
}
