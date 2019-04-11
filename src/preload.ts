import { type } from "os";

{
  // tslint:disable:no-var-requires
  const con = require("electron").remote.getGlobal("console");
  let ipcRenderer = require("electron").ipcRenderer;
  const hostname = window.location.hostname;
  function hostMatches(domain: string) {
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
  let ipcRenderer = require("electron").ipcRenderer;
  ipcRenderer.sendToHost("startLoginIn");
  ipcRenderer.send("TESTMESSAGE");

  ipcRenderer.sendToHost("getLoginDetails", askfordata);
  console.log("GETD");
  ipcRenderer.once("loginDetails", (e, key) => {
    console.log("ONCE");
    console.log("LOGINDETAILS", key);

    key = normalizeKey(key);

    let frame: HTMLDocument;
    if (key.loginiframe && document.querySelector<HTMLIFrameElement>(key.loginiframe)) {
       frame = document.querySelector<HTMLIFrameElement>(key.loginiframe)!.contentWindow!.document
    } else {
       frame = document
    }

    let hideObject = !!(
      document!.querySelector<HTMLInputElement>(key.hideobject) ||
      document!.getElementById(key.hideobject)
    );
    let errorObject =
      frame!.querySelector<HTMLInputElement>(key.errorobject) ||
      frame!.getElementById(key.errorobject);
    let waitUntil =
      frame!.querySelector<HTMLInputElement>(key.waituntil) ||
      frame!.getElementById(key.waituntil) ||
      frame!.querySelector<HTMLInputElement>(key.emailobject);

    let emailObject = frame!.querySelector<HTMLInputElement>(key.emailobject);
    let passwordObject = frame!.querySelector<HTMLInputElement>(key.passwordobject);
    let buttonObject = frame!.querySelector<HTMLInputElement>(key.buttonobject);
    let button1Object = frame!.querySelector<HTMLInputElement>(key.button1object);
    let button2Object = frame!.querySelector<HTMLInputElement>(key.button2object);
    let rememberObject = frame!.querySelector<HTMLInputElement>(key.rememberobject);

    console.log(
      "Objects",
      hideObject,
      errorObject,
      waitUntil,
      emailObject,
      passwordObject,
      buttonObject
    );

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
      console.log("already loggedIn");
      return;
    }

    if (!waitUntil && !hideObject) {
      setTimeout(() => getLoginDetails(askfordata + 1), 50);
      return;
    }

    if (key.type) {
      if ((key.type == 1 || key.type == 2) && passwordObject) {
        askfordata++;
        console.log("TYPE 1|2", key.type == 1, key.type == 2, passwordObject);
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        fillFormField(emailObject!, username);
        fillFormField(passwordObject!, password);

        clickButton(buttonObject!);
        repeatpossible = false;
      } else if (key.type == 3 || key.type == 4 || key.type == 5) {
        console.log("TYPE 3");
        //Two Steps
        ipcRenderer.sendToHost("showLoading");
        let username = key.key.username;
        let password = key.key.password;

        console.log(emailObject && emailObject!.value == "" && !passwordObject);

        if (
          (emailObject && emailObject!.value == "" && !passwordObject && !hideObject) ||
          (key.type == 5 && !clicked && !hideObject)
        ) {
          console.log("EMAIL AND NO PASSWORD");
          askfordata++;
          fillFormField(emailObject!, username);

          clickButton(button1Object!);
        }

        if (
          (passwordObject && passwordObject!.value == "" && !hideObject) ||
          (key.type == 5 && clicked && !hideObject)
        ) {
          console.log("EMAIL AND PASSWORD");
          askfordata++;
          if (key.type == 3) {
            repeatpossible = false;
          }
          fillFormField(passwordObject!, password);
          clickButton(button2Object!);
        }
        if (key.type == 4 && rememberObject) {
          clickButton(rememberObject!);
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
        console.log(
          "HIDING",
          r,
          hideObject,
          errorObject,
          key.hideobject,
          hideObject
        );
        if (!hideObject && !errorObject && r <= 50) {
          setTimeout(() => hideLoading(++r), 50);
        } else if (r > 75) {
          ipcRenderer.sendToHost("errorDetected");
          return;
        } else if (errorObject) {
            ipcRenderer.sendToHost("falseLogin");
          return;
        } else {
          let ipcRenderer = require("electron").ipcRenderer;
          ipcRenderer.sendToHost("loggedIn");
          ipcRenderer.sendToHost("hideLoading");
        }
      }
    } else {
      console.log("NOTYPE");
    }
  });
}

function clickButton(targetNode: HTMLElement): void {
  triggerMouseEvent(targetNode, "mouseover");
  setTimeout(() => {
    triggerMouseEvent(targetNode, "mousedown");
    setTimeout(() => {
      triggerMouseEvent(targetNode, "mouseup");
      triggerMouseEvent(targetNode, "click");
    }, 77);
  }, 146);
}

function triggerMouseEvent(node: HTMLElement, eventType: string): void {
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function fillFormField(target: HTMLInputElement, value: string) {
  target.dispatchEvent(new Event("focus", { bubbles: true, cancelable: true }));
  target.value = value;

  target.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  target.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
}
