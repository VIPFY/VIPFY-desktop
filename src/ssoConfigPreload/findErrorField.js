let ipcRenderer = require("electron").ipcRenderer;

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

const objects = {};
setTimeout(function() {
  walkDOM(document.body, function(n1) {
    const o = createObjFromDom(n1);
    if (o === null) return;
    objects[o.hash] = o;
  });
  console.log(Object.keys(objects).length);
  console.log(objects);
}, 1000);

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
      o.attr[attr.name] = attr.value;
    }
  }
  o.hash = hash(o);
  return o;
}
