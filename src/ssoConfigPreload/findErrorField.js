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
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

console.log("starting FindErrorField");

ipcRenderer.sendToHost("loaded", null);

const walkDOM = function(node, func) {
  func(node);
  node = node.firstChild;
  while (node) {
    walkDOM(node, func);
    node = node.nextSibling;
  }
};

let objects = {};
setTimeout(function() {
  walkDOM(document.body, function(n1) {
    const o = createObjFromDom(n1);
    if (o === null) return;
    objects[o.hash] = o;
  });
  console.log(Object.keys(objects).length);
  console.log(objects);
  ipcRenderer.sendToHost("domMap", objects);
}, 1000);

ipcRenderer.once("loginData", (e, key) => {
  console.log("login", key);
  fillFormField(document.querySelector(key.usernameField), key.username);
  fillFormField(document.querySelector(key.passwordField), key.password);
  clickButton(document.querySelector(key.button));

  objects = {};
  setTimeout(function() {
    walkDOM(document.body, function(n1) {
      const o = createObjFromDom(n1);
      if (o === null) return;
      objects[o.hash] = o;
    });
    console.log(Object.keys(objects).length);
    console.log(objects);
    ipcRenderer.sendToHost("domMap", objects);
  }, 1000);
});

const skipArgs = ["placeholder", "alt", "title", "aria-label"]; // don't use attributes likely to get translated
const hash = require("object-hash");
function createObjFromDom(elem) {
  if (elem.nodeType !== 1) {
    // ELEMENT_NODE
    return null;
  }
  const o = { tag: elem.tagName };
  if (elem.hasAttributes) {
    o.attr = {};
    for (const attr of elem.attributes) {
      if (skipArgs.includes(attr.name.toLowerCase())) {
        continue;
      }
      o.attr[attr.name] = attr.value;
    }
  }
  o.empty = !elem.hasChildNodes();
  o.hash = hash(o);
  return o;
}
