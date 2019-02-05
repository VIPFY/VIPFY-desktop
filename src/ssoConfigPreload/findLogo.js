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

ipcRenderer.sendToHost("loaded", null);

setTimeout(function() {
  try {
    findIcon();
  } catch (err) {
    ipcRenderer.sendToHost("noicon");
    ipcRenderer.sendToHost("nocolor");
    console.error(err);
  }

  try {
    //findLogo();
  } catch (err) {
    console.error(err);
  }
}, 2000);

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

  var t = Array.from(document.querySelectorAll("svg")).reduce(function(a, b) {
    return a.width.animVal.value * a.height.animVal.value >
      b.width.animVal.value * b.height.animVal.value
      ? a
      : b;
  });
  if (t !== null) {
    console.log("svg", t, svg_to_png_data(t));
    return svg_to_png_data(t);
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

// based on https://stackoverflow.com/questions/5433806/convert-embedded-svg-to-png-in-place
function svg_to_png_data(target) {
  var ctx, mycanvas, svg_data, img, child;

  var bounds = target.getBoundingClientRect();
  var width = bounds.width || target.width.animVal.value;
  var height = bounds.height || target.height.animVal.value;

  let origW = width;
  let origH = height;

  height = (1024 * origH) / origW;
  width = (height * origW) / origH;

  console.log("SVG", target, width, height);

  // Flatten CSS styles into the SVG
  for (i = 0; i < target.childNodes.length; i++) {
    child = target.childNodes[i];
    if (child.nodeName == "#text") continue;
    var cssStyle = window.getComputedStyle(child);
    if (cssStyle) {
      child.style.cssText = cssStyle.cssText;
    }
  }

  mycanvas = document.createElement("canvas");
  mycanvas.width = width;
  mycanvas.height = height;
  ctx = mycanvas.getContext("2d");

  var svgString = new XMLSerializer().serializeToString(target);
  var DOMURL = self.URL || self.webkitURL || self;
  var img = new Image();
  var svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  var url = DOMURL.createObjectURL(svg);
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    var png = mycanvas.toDataURL("image/png");
    ipcRenderer.sendToHost("logo", png);
    DOMURL.revokeObjectURL(png);
  };
  img.src = url;
  return null;
}

var iconsLeft = 0;
var icons = [];
const ICO = require("icojs");
const PNG = require("pngjs").PNG;

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
        try {
          const arrayBuffer = oReq.response;
          console.log("ICON", icon, ICO.isICO(arrayBuffer), isPNG(arrayBuffer));
          if (arrayBuffer) {
            if (ICO.isICO(arrayBuffer)) {
              ICO.parse(arrayBuffer, "image/png").then(function(images) {
                const largestSubfile = images.reduce(function(a, b) {
                  return a.width * a.height > b.width * b.height ? a : b;
                });
                console.log("largestsubfile", largestSubfile);
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
        } catch (err) {
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
    if (icons.length === 0) {
      ipcRenderer.sendToHost("noicon");
      ipcRenderer.sendToHost("nocolor");
      return;
    }

    const largestIcon = icons.reduce(function(a, b) {
      return a.width * a.height > b.width * b.height ? a : b;
    });

    const datastring = pngBufferToString(largestIcon.buffer);

    findDominantColor(datastring);

    ipcRenderer.sendToHost("icon", datastring, largestIcon.width, largestIcon.height);
  }
}

var palette = require("get-rgba-palette");
function findDominantColor(datastring) {
  var img = new Image();
  img.onload = function() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = palette(imageData.data, 5);

    const dominantColor = colors.sort((a, b) => a.amount - b.amount);
    const c = dominantColor[0];
    const hex = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`;

    const cssColors = colors.map(c => `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`);

    ipcRenderer.sendToHost("color", hex);
    ipcRenderer.sendToHost("colors", cssColors);
  };
  img.src = datastring;
}

// using color thief, results aren't that great
// const ColorThief = require("color-thief-browser");
// function findDominantColor(datastring) {
//   var img = new Image();
//   img.onload = function() {
//     const colorThief = new ColorThief();
//     const c = colorThief.getColor(img);
//     const hex = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`;

//     ipcRenderer.sendToHost("color", hex);
//   };
//   img.src = datastring;
// }

// unfinished, not working implementation using Vibrant
// const Vibrant = require("node-vibrant");
// function findDominantColorV(buffer) {
//   // var img = new Image();
//   // img.onload = async function() {
//   const b = Buffer.from(new Uint8Array(buffer));
//   console.log("DOMINA", b);
//   Vibrant.from(b)
//     .maxDimension(128)
//     .getPalette(function(swatch) {
//       console.log("SWATCH", swatch);
//       const s = Object.keys(swatch)
//         .reduce((acc, key) => {
//           const value = swatch[key];
//           if (!value) return acc;
//           acc.push({ popularity: value.getPopulation(), hex: value.getHex() });
//           return acc;
//         }, [])
//         .sort((a, b) => a.popularity <= b.popularity)
//         .map(color => color.hex);
//       console.log("COLOR", s);
//     });

//   // };
//   // img.src = datastring;
// }

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

function toHex(d) {
  return ("0" + Number(d).toString(16)).slice(-2).toLowerCase();
}
