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

setTimeout(function() {
  ipcRenderer.sendToHost("emailobject", getQueryString(findEmailField()));
  ipcRenderer.sendToHost("passwordobject", getQueryString(findPassField()));
  ipcRenderer.sendToHost("confirmbutton", getQueryString(findConfirmButton()));

  const logo = findLogo();
  if (logo) ipcRenderer.sendToHost("logo", logo);

  findIcon();
}, 3000);

function getQueryString(t) {
  if (t === null || t === undefined) return "!NO!";
  if (t.id) {
    return "#" + t.id;
  } else if (t.name && t.tagName) {
    return `${t.tagName.toLowerCase()}[name=${t.name}]`;
  } else if (t.tagName.toLowerCase() == "input" || t.tagName.toLowerCase() == "button") {
    if (t.type || t.class) {
      return `${t.tagName.toLowerCase()}[${t.type ? "type=" + t.type : ""} ${
        t.className ? 'class="' + t.className + '"' : ""
      }]`;
    }
  }
  return "UNKNOWN";
}

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
  "class",
  "alt"
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

function findLogo() {
  var t = Array.from(document.querySelectorAll("svg")).filter(filterDom(["logo", "brand"], []));
  if (t.length > 0) {
    console.log("svg", t[0], svg_to_png_data(t[0]));
    return svg_to_png_data(t[0]);
  }
  t = Array.from(document.querySelectorAll("img"))
    .filter(filterDom(["logo", "brand"], []))
    .filter(function(t) {
      return t.scrollWidth > 0 && t.scrollHeight > 0;
    });
  if (t.length > 0) {
    console.log("img", t[0], img_to_png_data(t[0]));
    return img_to_png_data(t[0]);
  }
  return null;
}

function img_to_png_data(target) {
  mycanvas = document.createElement("canvas");

  var bounds = target.getBoundingClientRect();
  var width = target.naturalWidth || bounds.width;
  var height = target.naturalHeight || bounds.height;

  mycanvas.width = width;
  mycanvas.height = height;
  ctx = mycanvas.getContext("2d");
  ctx.drawImage(target, 0, 0);
  console.log(target.offsetWidth, target.offsetHeight);

  // Return the canvas's data
  return mycanvas.toDataURL("image/png");
}

// from https://stackoverflow.com/questions/5433806/convert-embedded-svg-to-png-in-place
function svg_to_png_data(target) {
  var ctx, mycanvas, svg_data, img, child;

  var bounds = target.getBoundingClientRect();
  var width = bounds.width || target.width.animVal.value;
  var height = bounds.height || target.height.animVal.value;

  console.log("SVG", target, width, height);

  // Flatten CSS styles into the SVG
  for (i = 0; i < target.childNodes.length; i++) {
    child = target.childNodes[i];
    console.log("getStyle", child);
    if (child.nodeName == "#text") continue;
    var cssStyle = window.getComputedStyle(child);
    if (cssStyle) {
      child.style.cssText = cssStyle.cssText;
    }
  }

  // Construct an SVG image
  svg_data =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    width +
    '" height="' +
    height +
    '">' +
    target.innerHTML +
    "</svg>";
  img = new Image();
  img.src = "data:image/svg+xml," + encodeURIComponent(svg_data);

  // Draw the SVG image to a canvas
  mycanvas = document.createElement("canvas");
  mycanvas.width = width;
  mycanvas.height = height;
  ctx = mycanvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Return the canvas's data
  return mycanvas.toDataURL("image/png");
}

const ICO = require("icojs");
const PNG = require("pngjs").PNG;
iconsLeft = 0;
icons = [];
function findIcon() {
  const possibleIcons = Array.from(document.querySelectorAll("link[rel*='icon']")).map(function(t) {
    return t.href;
  });
  possibleIcons.push("/favicon.ico");

  iconsLeft = possibleIcons.length;

  console.log("possibleIcons", possibleIcons);

  for (const icon of possibleIcons) {
    try {
      const oReq = new XMLHttpRequest();
      oReq.open("GET", icon, true);
      oReq.responseType = "arraybuffer";

      oReq.onload = function(oEvent) {
        const arrayBuffer = oReq.response;
        console.log("ICON", icon, ICO.isICO(arrayBuffer), isPNG(arrayBuffer));
        if (arrayBuffer) {
          if (ICO.isICO(arrayBuffer)) {
            ICO.parse(arrayBuffer, "image/png").then(images => {
              const largestSubfile = images.reduce(function(a, b) {
                return a.width * a.height > b.width * b.height ? a : b;
              });
              icons.push({
                width: largestSubfile.width,
                height: largestSubfile.height,
                buffer: largestSubfile.buffer
              });
              finishIcon();
            });
          } else if (isPNG(arrayBuffer)) {
            new PNG().parse(arrayBuffer, function(error, data) {
              if (error) {
                finishIcon();
                return;
              }
              icons.push({
                width: data.width,
                height: data.height,
                buffer: arrayBuffer
              });
              console.log("newIcon", icons[icons.length - 1]);
              finishIcon();
            });
          } else {
            finishIcon();
          }
        } else {
          finishIcon();
        }
      };

      oReq.send(null);
    } catch (err) {
      console.log(err);
      finishIcon();
    }
  }
}
function finishIcon() {
  iconsLeft -= 1;
  console.log("iconsleft", iconsLeft);
  if (iconsLeft === 0) {
    const largestIcon = icons.reduce(function(a, b) {
      return a.width * a.height > b.width * b.height ? a : b;
    });

    console.log("selected icon", largestIcon);

    ipcRenderer.sendToHost("icon", pngBufferToString(largestIcon.buffer));
  }
}

function isPNG(buffer) {
  const a = new Uint8Array(buffer);
  // see https://tools.ietf.org/html/rfc2083#page-11
  return (
    a[0] == 137 &&
    a[1] == 80 &&
    a[2] == 78 &&
    a[3] == 71 &&
    a[4] == 13 &&
    a[5] == 10 &&
    a[6] == 26 &&
    a[7] == 10
  );
}

function pngBufferToString(buffer) {
  return (
    "data:image/png;base64," +
    btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))
  );
}
