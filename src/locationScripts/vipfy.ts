module.exports = function() {
  window.addEventListener("DOMContentLoaded", onready);
};

function onready() {
  document.getElementById("btn-register")!.innerHTML = "Vipfy is cool";
  let nodes = document.getElementById("desktopheader")!.childNodes as NodeListOf<HTMLElement>;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].innerHTML.indexOf("Register") != -1) {
      nodes[i].innerHTML += "&#129370;";
    } else if (nodes[i].innerHTML.indexOf("Market") != -1) {
      nodes[i].style.display = "none";
   }
  }
}