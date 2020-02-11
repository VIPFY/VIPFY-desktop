const { ipcRenderer } = require("electron");

const hostname = window.location.hostname;

function hostMatches(domain) {
  return new RegExp(domain).test(hostname);
}

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

window.addEventListener("load", function() {
  getLoginDetails(0);
});

setInterval(() => timer(), 30000);
setTimeout(() => timer(), 5000);


  document.addEventListener("mousedown", onClick, true);
  (function() {
    Element.prototype._addEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function(a,b,c) {
      if(c==undefined)
        c=false;
      this._addEventListener(a,b,c);
      if(!this.eventListenerList)
        this.eventListenerList = {};
      if(!this.eventListenerList[a])
        this.eventListenerList[a] = [];
      //this.removeEventListener(a,b,c); // TODO - handle duplicates..
      this.eventListenerList[a].push({listener:b,useCapture:c});
    };
  
    Element.prototype.getEventListeners = function(a){
      if(!this.eventListenerList)
        this.eventListenerList = {};
      if(a==undefined)
        return this.eventListenerList;
      return this.eventListenerList[a];
    };
    Element.prototype.clearEventListeners = function(a){
      if(!this.eventListenerList)
        this.eventListenerList = {};
      if(a==undefined){
        for(var x in (this.getEventListeners())) this.clearEventListeners(x);
          return;
      }
      var el = this.getEventListeners(a);
      if(el==undefined)
        return;
      for(var i = el.length - 1; i >= 0; --i) {
        var ev = el[i];
        this.removeEventListener(a, ev.listener, ev.useCapture);
      }
    };
  
    Element.prototype._removeEventListener = Element.prototype.removeEventListener;
    Element.prototype.removeEventListener = function(a,b,c) {
      if(c==undefined)
        c=false;
      this._removeEventListener(a,b,c);
        if(!this.eventListenerList)
          this.eventListenerList = {};
        if(!this.eventListenerList[a])
          this.eventListenerList[a] = [];
  
        // Find the event in the list
        for(var i=0;i<this.eventListenerList[a].length;i++){
            if(this.eventListenerList[a][i].listener==b, this.eventListenerList[a][i].useCapture==c){ // Hmm..
                this.eventListenerList[a].splice(i, 1);
                break;
            }
        }
      if(this.eventListenerList[a].length==0)
        delete this.eventListenerList[a];
    };
  })();

  function hasEventHandler(t: Element, e: string) {
    return t["on"+e] || t.getAttribute("on"+e) || (t.getEventListeners(e) && t.getEventListeners(e).length > 0);
  }

  function elemIsButton(t: Element | null) {
    if(!t) {
      return false;
    }
    if(t.tagName == "BUTTON" || t.tagName == "INPUT" || t.tagName == "A") {
      return true;
    }

    if(hasEventHandler(t, "click") || hasEventHandler(t, "mousedown") || hasEventHandler(t, "dragstart")) {
      return true;
    }
    return false;
  }

  function onClick(e: MouseEvent) {
    let t = e.target as Element | null;
    let isButton = true;
    while (t &&!elemIsButton(t) && t.parentElement != null) {
      t = t.parentElement;
    }
    if (!t || t.parentElement == null) {
      t = e.target as Element | null;
      isButton = false;
    }
    let elementX, elementY, elementW, elementH;
    if (t) {
      const b = t.getBoundingClientRect();
      elementX = b.left;
      elementY = b.top;
      elementW = b.width;
      elementH = b.height;
    }
    console.log(t);
    t.style.outline = "solid pink 1px";
    console.log({
      eventType: "mc",
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowW: window.innerWidth,
      windowH: window.innerHeight,
      elementX,
      elementY,
      elementW,
      elementH,
      isButton,
      time: e.timeStamp
    });
    if (!isButton) {
      console.warn("clicked nonbutton", t);
    }
  }

function normalizeKey(key) {
  if (key.emailtype ? key.emailtype == 2 : key.type == 2) {
    key.emailobject = "#" + key.emailobject;
    key.emailtype = 1;
  }
  if (key.passwordtype ? key.passwordtype == 2 : key.type == 2) {
    key.passwordobject = "#" + key.passwordobject;
    key.passwordtype = 1;
  }
  if (key.buttontype ? key.buttontype == 2 : key.type == 2) {
    key.buttonobject = "#" + key.buttonobject;
    key.buttontype = 1;
  }
  if (key.button1type == 2) {
    key.button1object = "#" + key.button1object;
    key.button1type = 1;
  }
  if (key.button2type == 2) {
    key.button2object = "#" + key.button2object;
    key.button2type = 1;
  }
  if (!key.button1object) {
    key.button1object = key.buttonobject;
  }
  if (!key.button2object) {
    key.button2object = key.buttonobject;
  }
  if (key.emptyerrortype) {
    key.errorobject = key.errorobject + ":not(:empty)";
    key.emptyerrortype = undefined;
  }
  return key;
}

function getLoginDetails(askfordata) {
  let repeatpossible = true;
  let clicked = false;
  ipcRenderer.sendToHost("startLoginIn");
  ipcRenderer.send("TESTMESSAGE");

  ipcRenderer.sendToHost("getLoginDetails", askfordata);
  ipcRenderer.once("loginDetails", (e, key) => {
    key = normalizeKey(key);

    let frame;
    if (key.loginiframe && document.querySelector(key.loginiframe)) {
      frame = document.querySelector(key.loginiframe).contentWindow.document;
    } else {
      frame = document;
    }

    let hideObject = !!(
      document.querySelector(key.hideobject) || document.getElementById(key.hideobject)
    );
    let errorObject = frame.querySelector(key.errorobject) || frame.getElementById(key.errorobject);
    let waitUntil =
      frame.querySelector(key.waituntil) ||
      frame.getElementById(key.waituntil) ||
      frame.querySelector(key.emailobject);

    let emailObject = frame.querySelector(key.emailobject);
    let passwordObject = frame.querySelector(key.passwordobject);
    let buttonObject = frame.querySelector(key.buttonobject);
    let button1Object = frame.querySelector(key.button1object);
    let button2Object = frame.querySelector(key.button2object);
    let rememberObject = frame.querySelector(key.rememberobject);

    if (!key.hideobject) {
      hideObject = !passwordObject;
    }

    if (hideObject) {
      ipcRenderer.sendToHost("hideLoading");
      ipcRenderer.sendToHost("loggedIn");
      return;
    }

    if (askfordata > 50 || errorObject) {
      console.log("STOP RETRY", askfordata, errorObject);
      ipcRenderer.sendToHost("errorDetected");
      return;
    }

    if (key.loggedIn) {
      ipcRenderer.sendToHost("hideLoading");
      return;
    }

    if (!waitUntil && !hideObject) {
      setTimeout(() => getLoginDetails(askfordata + 1), 50);
      return;
    }

    if (key.type) {
      if ((key.type == 1 || key.type == 2) && passwordObject) {
        askfordata++;
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        fillFormField(emailObject, username);
        fillFormField(passwordObject, password);

        clickButton(buttonObject);
        repeatpossible = false;
      } else if (key.type == 3 || key.type == 4 || key.type == 5) {
        //Two Steps
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        if (
          (emailObject && emailObject.value == "" && !passwordObject && !hideObject) ||
          (key.type == 5 && !clicked && !hideObject)
        ) {
          askfordata++;
          fillFormField(emailObject, username);

          clickButton(button1Object);
        }

        if (
          (passwordObject && passwordObject.value == "" && !hideObject) ||
          (key.type == 5 && clicked && !hideObject)
        ) {
          askfordata++;
          if (key.type == 3) {
            repeatpossible = false;
          }
          fillFormField(passwordObject, password);
          clickButton(button2Object);
        }
        if (key.type == 4 && rememberObject) {
          clickButton(rememberObject);
          repeatpossible = false;
        }
      }
      hideLoading();

      if (
        (key.repeat || key.type == 3 || key.type == 4 || key.type == 5) &&
        repeatpossible &&
        !hideObject
      ) {
        if (key.type == 5) {
          clicked = true;
        }
        setTimeout(function() {
          getLoginDetails(askfordata);
        }, 50);
      }

      function hideLoading(r = 0) {
        if (!hideObject && !errorObject && r <= 50) {
          setTimeout(() => hideLoading(++r), 50);
        } else if (r > 75) {
          ipcRenderer.sendToHost("errorDetected");
          return;
        } else if (errorObject) {
          ipcRenderer.sendToHost("falseLogin");
          return;
        } else {
          ipcRenderer.sendToHost("loggedIn");
          ipcRenderer.sendToHost("hideLoading");
        }
      }
    } else {
      console.log("NOTYPE");
    }
  });
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

function fillFormField(target, value) {
  target.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
  target.value = value;

  target.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  target.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
}
