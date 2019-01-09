let ipcRenderer = require("electron").ipcRenderer;

document.onclick = function(e) {
  var t = e.target;
  if (t.id) {
    ipcRenderer.sendToHost("gotId", "#" + e.target.id);
  } else if (t.name && t.tagName) {
    ipcRenderer.sendToHost("gotId", `${t.tagName.toLowerCase()}[name=${t.name}]`);
  } else if (t.tagName.toLowerCase() == "input" || t.tagName.toLowerCase() == "button") {
    if (t.type || t.class) {
      ipcRenderer.sendToHost(
        "gotId",
        `${t.tagName.toLowerCase()}[${t.type ? "type=" + t.type : ""} ${
          t.className ? 'class="' + t.className + '"' : ""
        }]`
      );
    }
  }
};
