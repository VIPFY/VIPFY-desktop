import { ipcRenderer } from "electron";

Object.defineProperty(String.prototype, "includesAny", {
  value: function(searches) {
    for (search of searches) {
      if (this.indexOf(search) !== -1) {
        return true;
      }
    }
    return false;
  }
});

setTimeout(function() {
  var t = Array.from(findForm().querySelectorAll("[type='submit']")).map(function(t) {
    return `#${t.id} ${t.tagName.toLowerCase()}[name='${t.name}']`;
  });
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("button, input[type='button'], [role='button']"))
      .filter(function(e) {
        return filterDom(["sign", "log", "submit"], ["oauth", "google", "facebook", "forgot"]);
      })
      .map(function(t) {
        return `#${t.id} ${t.tagName.toLowerCase()}[name='${t.name}']`;
      });
  }

  if (t.length > 0) {
    ipcRenderer.sendToHost("", JSON.stringify(t));
  } else {
    ipcRenderer.sendToHost("", "!NO!");
  }
}, 3000);

function findForm() {
  const forms = Array.from(document.querySelectorAll("form")).filter(
    filterDom(["signin", "sign-in", "log"], ["oauth", "facebook", "signup", "forgot"])
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
    filterDom(["email", "user"], [])
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
  return t[0];
}

const attributes = [
  "name",
  "id",
  "aria-label",
  "aria-roledescription",
  "placeholder",
  "ng-model",
  "class"
];

function filterDom(includesAny, excludesAll) {
  return function(element) {
    if (!element.hasAttributes()) {
      return false;
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
