const { ipcRenderer } = require("electron");

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

Object.defineProperty(String.prototype, "includesAnyRegExp", {
  value: function(searches) {
    for (const search of searches) {
      if (search.test(this)) {
        return true;
      }
    }
    return false;
  }
});

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms / speed));
};

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

setInterval(() => timer(), 30000);
setTimeout(() => timer(), 5000);

let emailEntered = false;
let passwordEntered = false;
let domainEntered = false;
let stopped = false;
let speed = 1;
let recaptchaConfirmOnce = false;
let checkRecaptcha = false;

ipcRenderer.once("loginData", async (e, key) => {
  //console.log("LOGIN DATA WEBSEITE", stopped, emailEntered, passwordEntered, key);
  if (key.execute) {
    //Use execute method
    //console.log("EXECUTEARRAY", key.execute.slice(key.step));
    execute(key.execute.slice(key.step), true);
  } else {
    //Use universal Login
    if (stopped) return;
    emailEntered = key.emailEntered;
    passwordEntered = key.passwordEntered;
    domainEntered = key.domainEntered;
    speed = key.speed || 1;
    let didAnything = false;
    while (!emailEntered || !passwordEntered || stopped) {
      await sleep(100);
      let totaltime = 100;
      let email = findEmailField();
      let password = findPassField();
      let button = findConfirmButton();
      let cookiebutton = findCookieButton();
      let recaptcha;
      didAnything = false;
      while (totaltime < 5000) {
        if (email || emailEntered || cookiebutton) break;
        await sleep(300);
        totaltime += 300;
        email = findEmailField();
        cookiebutton = findCookieButton();
      }
      await sleep(500);
      if (cookiebutton) {
        await clickButton(cookiebutton);
      }

      recaptcha = findRecaptcha();
      if (recaptcha && !checkRecaptcha) {
        //console.log("FOUND RECAPTCHA");
        await recaptchaClick(recaptcha);
        await sleep(100);
        document.querySelector("html").style.visibility = "hidden";
        document.querySelector("iframe[src*='/recaptcha/api2/bframe']").style.visibility =
          "visible";

        checkRecaptcha = true;

        if (!recaptchaConfirmOnce) {
          //console.log("SOLVED RECAPTCHA");
          setInterval(verifyRecaptcha, 100);
        }
      }
      if (!recaptcha || recaptchaConfirmOnce) {
        document.querySelector("html").style.visibility = "visible";
        await sleep(100);
        if (key.domainNeeded) {
          domain = findDomainField();
          if (domain && !domainEntered) {
            await clickButton(domain);
            await fillFormField(domain, "domain");
            domainEntered = true;
            didAnything = true;
          }
        }
        await sleep(100);
        email = findEmailField();
        if (email && !emailEntered) {
          await clickButton(email);
          await fillFormField(email, "username");
          emailEntered = true;
          didAnything = true;
        }
        await sleep(100);
        password = findPassField();
        if (password && !passwordEntered) {
          await clickButton(password);
          await fillFormField(password, "password");
          passwordEntered = true;
          didAnything = true;
        }
        await sleep(100);
        button = findConfirmButton();
        if (button && didAnything) {
          await clickButton(button);
          didAnything = true;
        }
      }
      await sleep(500);
    }
    if (emailEntered && passwordEntered && !stopped) {
      recaptcha = document.querySelector('iframe[src*="/recaptcha/"]:not([src*="/anchor?"])');
      if (recaptcha && (recaptcha.scrollHeight != 0 || recaptcha.scrollWidth != 0)) {
        ipcRenderer.sendToHost("recaptcha", null);
      } else {
        // Special Case for Wrike
        if (document.querySelector("[wrike-button-v2][data-application='login-remember']")) {
          //console.log("SPEZIAL");
          clickButton(
            document.querySelector("[wrike-button-v2][data-application='login-remember']")
          );
        }
      }
    }
  }
});

async function start() {
  //if (!document.body.id.includes("beacon")) {
  //console.log("START TEST", location.href);
  ipcRenderer.sendToHost("loaded", null);
  ipcRenderer.sendToHost("getLoginData", null);
  //console.log("START TEST END", location.href);
  //}
}

start();
/*
if (document.readyState === "complete") {
  start();
} else {
  window.addEventListener("DOMContentLoaded", start, false);
}*/

async function fillFormField(target, content) {
  //console.log("FILL", target, content);
  if (stopped) throw new Error("abort");
  //target.focus();
  // await sleep(250);
  // target.focus();
  //  await sleep(250);
  const p = new Promise(resolve =>
    ipcRenderer.once("formFieldFilled", async (e, key) => {
      if (stopped) return;
      resolve();
    })
  );
  ipcRenderer.sendToHost("fillFormField", content);
  return p;
}

window.addEventListener("beforeunload", () => {
  stopped = true;
  ipcRenderer.sendToHost("unload", null);
});

function isHidden(elem) {
  if (!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length)) return true;
  const style = window.getComputedStyle(elem);
  if (style.display === "none" || style.opacity === 0 || style.visibility === "hidden") return true;
  const pos = getMidPoint(elem);
  const e = document.elementFromPoint(pos.x, pos.y);
  return !isEqualOrChild(e, elem);
}

function isEqualOrChild(child, parent) {
  if (child == parent) return true;
  if (child === null || parent === null) return false;
  while (child.parentElement !== null) {
    child = child.parentElement;
    if (child == parent) return true;
  }
  return false;
}

function getMidPoint(e, doc) {
  if (e) {
    var rect = e.getBoundingClientRect();
    const style = window.getComputedStyle(e);
    var dx = 0;
    var dy = 0;
    if (doc) {
      var iframe = document.querySelector(args.document);
      var drect = iframe.getBoundingClientRect();
      dx = drect.x;
      dy = drect.y;
    }
    return {
      x:
        dx +
        rect.x +
        parseInt(style.paddingLeft) +
        (rect.width - parseInt(style.paddingLeft) - parseInt(style.paddingRight)) / 10,
      y:
        dy +
        rect.y +
        parseInt(style.paddingTop) +
        (rect.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom)) / 2
    }; // bias to the left
  }
}

function clickButton(targetNode, doc) {
  var rect = getMidPoint(targetNode, doc);

  if (stopped) throw new Error("abort");
  const p = new Promise(resolve =>
    ipcRenderer.once("clicked", async (e, key) => {
      if (stopped) return;
      resolve();
    })
  );
  if (rect) {
    ipcRenderer.sendToHost("click", rect.x, rect.y);
  }
  return p;
  /* triggerMouseEvent(targetNode, "mouseover");
  setTimeout(() => {
    triggerMouseEvent(targetNode, "mousedown");
    setTimeout(() => {
      triggerMouseEvent(targetNode, "mouseup");
      triggerMouseEvent(targetNode, "click");
    }, 77);
  }, 146);*/
}

function triggerMouseEvent(node, eventType) {
  node.focus();
  const clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function findForm(ignoreForm) {
  if (ignoreForm) return document;
  let forms = Array.from(document.querySelectorAll("form")).filter(
    filterDom(["sign.?in", "log.?in"], ["oauth", "facebook", "sign.?up", "forgot", "google"])
  );

  if (forms.length == 0) {
    forms = Array.from(document.querySelectorAll("form"))
      .filter(filterDom([], ["oauth", "facebook", "sign.?up", "forgot", "google"]))
      .filter(
        e =>
          Array.from(e.querySelectorAll("input")).filter(
            filterDom(["email", "user", "log.?in", "name", "pw", "pass"], [])
          ).length > 0
      );
  }

  return forms.length == 1 ? forms[0] : document;
}

function findPassField() {
  let t = Array.from(findForm().querySelectorAll("input[type=password]"))
    .filter(filterDom(["pass", "pw"], ["repeat", "confirm", "forgot", "button"]))
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("input[type=password]"))
      .filter(filterDom([], ["repeat", "confirm", "forgot"]))
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  return t[0];
}

function findEmailField() {
  let t = Array.from(findForm().querySelectorAll("input"))
    .filter(
      filterDom(["email", "user", "log.?in", "name"], ["pw", "pass", "accountname", "button"])
    )
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("input[type=email]"))
      .filter(filterDom([], ["pw", "pass"]))
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  return t[0];
}

function findDomainField() {
  let t = Array.from(findForm().querySelectorAll("input"))
    .filter(filterDom(["account", "domain"], ["pw", "pass", "email"]))
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  return t[0];
}

function findDomainField() {
  let t = Array.from(findForm().querySelectorAll("input"))
    .filter(filterDom(["account", "domain"], ["pw", "pass", "email"]))
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  console.log("DOMAIN", t);
  return t[0];
}

function findConfirmButton(ignoreForm) {
  var t = [];
  if (findForm() != document) {
    t = Array.from(findForm().querySelectorAll("[type='submit']"))
      .filter(
        filterDom(
          [],
          [
            "oauth",
            "google",
            "facebook",
            "forgot",
            "newsletter",
            "sign.?up",
            "free.?trial",
            "visibility"
          ]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm(ignoreForm).querySelectorAll(
        "a, button, input[type='button'], [role='button'], [class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          ["sign.?in", "log.?in", "submit", "next", "cont(?![a-hj-z])"],
          [
            "oauth",
            "google",
            "facebook",
            "linkedin",
            "forgot",
            "newsletter",
            "sign.?up",
            "free.?trial",
            "visibility"
          ]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm(ignoreForm).querySelectorAll(
        "a, button, input[type='button'], [role='button'], [class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          ["agree", "proceed", "accept"],
          [
            "oauth",
            "google",
            "facebook",
            "linkedin",
            "forgot",
            "newsletter",
            "sign.?up",
            "free.?trial",
            "visibility"
          ]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(findForm().querySelectorAll("[type='submit']"))
      .filter(
        filterDom(
          [],
          [
            "oauth",
            "google",
            "facebook",
            "forgot",
            "newsletter",
            "sign.?up",
            "free.?trial",
            "visibility"
          ]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm().querySelectorAll(
        "button, input[type='button'], [role='button'], [class~='btn-success']"
      )
    )
      .filter(
        filterDom(
          [],
          [
            "oauth",
            "google",
            "facebook",
            "linkedin",
            "forgot",
            "newsletter",
            "sign.?up",
            "free.?trial",
            "visibility"
          ]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  if (t.length == 0) {
    t = Array.from(
      findForm().querySelectorAll(
        "[class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          [],
          [
            "oauth",
            "google",
            "facebook",
            "linkedin",
            "forgot",
            "newsletter",
            "sign.?up",
            "free.?trial",
            "visibility"
          ]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }

  if (t.length == 0 && !ignoreForm) return findConfirmButton(true);

  return t[0];
}

function findCookieButton() {
  console.log("find Cookie Button");
  var t = Array.from(
    document.querySelectorAll(
      "#onetrust-accept-btn-handler, [class~=cc-compliance] > [class~=cc-dismiss], [class~='consent'] > a[class~='call'], [ba-click='{{allow()}}']"
    )
  )
    .filter(e => !isHidden(e))
    .filter(e => !e.disabled);
  if (t.length == 0) {
    var trustArc = document.querySelector("[src*='https://consent-pref.trustarc.com/']");
    if (trustArc) {
      t = Array.from(
        trustArc.contentWindow.document.querySelectorAll("[class~=call], [role='button']")
      );
    }
  }
  if (t.length == 0) {
    t = Array.from(
      document.querySelectorAll(
        "button, input[type='button'], [role='button'], [class~='btn'], [class~='cc-btn'], [class~='button'], [class~='btn-small']"
      )
    )
      .filter(
        filterDom(
          ["dismiss", "cookie", "consent"],
          ["oauth", "google", "facebook", "linkedin", "forgot", "newsletter"]
        )
      )
      .filter(e => !isHidden(e))
      .filter(e => !e.disabled);
  }
  console.log("return Cookie Button", t[0]);
  return t[0];
}

// 168/255
// 80/119 110/119 107/119
const attributes = [
  "name",
  "id",
  "aria-label",
  "aria-roledescription",
  "placeholder",
  "ng-model",
  "data-ng-model",
  "data-callback",
  "data-name",
  "class",
  "value",
  "alt",
  "data-testid",
  "href",
  "data-event-click-target"
];

function filterDom(includesAny, excludesAll) {
  includesAny = includesAny.map(i => new RegExp(i));
  excludesAll = excludesAll.map(i => new RegExp(i));
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
      if (val.includesAnyRegExp(excludesAll)) {
        return false;
      }
    }
    for (const attribute of attributes) {
      const attr = element.attributes.getNamedItem(attribute);
      if (attr === null) continue;
      const val = attr.value.toLowerCase();
      if (val.includesAnyRegExp(includesAny)) {
        return true;
      }
    }
    if (includesAny.length == 0) return true;
    return false;
  };
}

function verifyRecaptcha() {
  if (!recaptchaConfirmOnce) {
    try {
      if (grecaptcha.getResponse().length !== 0) {
        //alert("Recaptcha verified");
        recaptchaConfirmOnce = true;
        //console.log("VERIFY RECAP");
        ipcRenderer.sendToHost("recaptchaSuccess");
      }
    } catch (error) {
      console.error("Recaptcha ERROR:", error);
      if (String(error).includes("No reCAPTCHA clients exist")) {
        //console.log("No Recaptcha");
        recaptchaConfirmOnce = true;
        ipcRenderer.sendToHost("recaptchaSuccess");
      }
    }
  }
}

function findRecaptcha() {
  let t = document.querySelector('iframe[src*="/recaptcha/"]:not([src*="/anchor?"])');
  //console.log("button", t);
  if (t && isHidden(t)) {
    /*let f = fetchFieldProps(appname);
    let recaptchaTag = f[0].fields.recaptcha;
    if (recaptchaTag) {
      let t = document.querySelector(recaptchaTag.tag_props);
      console.log("recaptcha", t);
      return t;
    } else {
      return false;
    }*/
    return false;
  }
  return t;
}

async function recaptchaClick(recap) {
  //console.log("LET CLICK", recap);
  if (!checkRecaptcha) {
    recap.scrollIntoView();
    recap.focus();
    checkRecaptcha = true;
    let pos = recap.getBoundingClientRect();
    ipcRenderer.sendToHost("recaptcha", pos.left, pos.width, pos.top, pos.height);
  }
}

//Script based login functions

async function execute(operations, mainexecute = false) {
  let doc;
  for ({ operation, args = {} } of operations) {
    if (args.documents) {
      doc = document;
      args.documents.forEach(thisdoc => {
        doc = doc.querySelector(thisdoc).contentWindow.document;
      });
    } else if (args.document) {
      doc = document.querySelector(args.document).contentWindow.document;
    } else {
      doc = document;
    }
    switch (operation) {
      case "sleep":
        let randomrange = args.randomrange || args.seconds / 5;
        await sleep(Math.max(0, args.seconds + Math.random() * randomrange - randomrange / 2));
        break;
      case "waitfor":
        const p = new Promise(async resolve => {
          while (!doc.querySelector(args.selector)) {
            doc = args.document
              ? document.querySelector(args.document).contentWindow.document
              : document;
            await sleep(95 + Math.random() * 10);
          }
          resolve();
        });
        await p;
        break;
      case "click":
        await clickButton(doc.querySelector(args.selector), args.document);
        break;
      case "fill":
        //console.log("fill", doc.querySelector(args.selector), args.fillkey);
        await fillFormField(doc.querySelector(args.selector), args.fillkey);
        break;
      case "solverecaptcha":
        //console.log("solverecaptcha", doc.querySelector(args.selector));
        await recaptchaClick(doc.querySelector(args.selector));
        if (!recaptchaConfirmOnce) {
          setInterval(verifyRecaptcha, 100);
        }
        break;
      case "recaptcha":
        await execute([
          { operation: "waitfor", args },
          { operation: "solverecaptcha", args }
        ]);
        break;
      case "waitandfill":
        await execute([
          { operation: "waitfor", args },
          { operation: "click", args },
          { operation: "fill", args }
        ]);
        break;
      case "cookie":
        let cookiebutton = null;

        let totaltime = 0;
        //console.log("EXECUTE COOKIE");
        while (totaltime < 5000) {
          if (args.selector ? doc.querySelector(args.selector) : cookiebutton) {
            //Wait for animations
            let oldposx,
              oldposy,
              oldposx2,
              oldposy2 = undefined;
            let newposx,
              newposy,
              newposx2,
              newposy2 = undefined;
            let rect;
            let waittime = 0;
            while (
              (!(
                oldposx == newposx &&
                oldposy == newposy &&
                oldposx2 == newposx2 &&
                oldposy2 == newposy2
              ) ||
                oldposx == undefined) &&
              waittime < 5000
            ) {
              oldposx = newposx;
              oldposy = newposy;
              oldposx2 = newposx2;
              oldposy2 = newposy2;
              rect = doc.querySelector(args.selector).getBoundingClientRect();
              newposx = rect.left;
              newposy = rect.top;
              newposx2 = rect.right;
              newposy2 = rect.bottom;
              await sleep(100);
              waittime += 100;
            }

            await clickButton(args.selector ? doc.querySelector(args.selector) : cookiebutton);
            break;
          }
          await sleep(300);
          totaltime += 300;
          cookiebutton = await findCookieButton();
        }
        break;
    }
    if (mainexecute && operation) {
      ipcRenderer.sendToHost("executeStep");
    }
  }
  return;
}
