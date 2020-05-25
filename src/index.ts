import {
  app,
  BrowserWindow,
  autoUpdater,
  dialog,
  protocol,
  session,
  ipcMain,
  BrowserView,
  webContents
} from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  APOLLO_DEVELOPER_TOOLS,
  REACT_PERF
} from "electron-devtools-installer";
import path from "path";
import Store from "electron-store";
import * as is from "electron-is";
import { logger } from "./logger";
import configJSON from "../config.json";

process.on("uncaughtException", error => {
  logger.error(error);
});

app.commandLine.appendSwitch("disable-site-isolation-trials");

let devtools = null;

const store = new Store();
const key = getSetupKey();
if (key !== false) {
  store.set("setupkey", key);
}

if (!is.all(is.dev, is.osx) && require("electron-squirrel-startup")) {
  app.quit();
}

let disableUpdater = is.all(is.dev, is.osx); // autoupdater on dev mode on mac fails with certificate error and crashes app

const DOMAIN = "https://storage.googleapis.com/releases.vipfy.store";
const suffix =
  process.platform === "darwin" ? `/RELEASES.json?method=JSON&version=${app.getVersion()}` : "";

if (!disableUpdater) {
  autoUpdater.setFeedURL({
    url: `${DOMAIN}/VIPFY/${configJSON.channelID}/${process.platform}/${process.arch}${suffix}`,
    serverType: "json"
  });

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail: "A new version has been downloaded. Restart the application to apply the updates."
    };

    autoUpdater.on("error", error => {
      logger.error("Autoupdater error", error);
    });

    dialog.showMessageBox(dialogOpts, response => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      } else {
        disableUpdater = true;
      }
    });
  });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

let isDevMode = !!process.execPath.match(/[\\/]electron/);

const vipfyHandler = (request, callback) => {
  const url = request.url.substr(8);
  // callback({path: path.normalize(`${__dirname}/${url}`)})

  if (url.startsWith("todo")) {
    callback({ path: path.normalize(`${app.getAppPath()}/src/todo.html`) });
    return;
  } else if (url.startsWith("blank")) {
    callback({ path: path.normalize(`${app.getAppPath()}/src/blank.html`) });
    return;
  } else if (url.startsWith("marketplace/")) {
    mainWindow.webContents.send("change-page", `/area/${url}`);
  }

  callback({ path: path.normalize(`${app.getAppPath()}/src/blank.html`) });
};

function getSetupKey() {
  try {
    const i = process.argv.findIndex(arg => arg == "--squirrel-install");
    if (i == -1 || process.argv.length - 1 == i) {
      return false;
    }

    const installerExe = process.argv[i + 2];
    const candidateKey = installerExe.split("-").slice(-1)[0].split(".")[0];

    if (candidateKey.length !== 21) {
      return false;
    }

    if (!checkSetupKey(candidateKey)) {
      return false;
    }

    return candidateKey;
  } catch (e) {
    return false;
  }
}

function checkSetupKey(key) {
  try {
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let sum = 0;
    for (let i = 0; i < 20; i++) {
      let index = alphabet.indexOf(key[i]);
      if (index === -1) {
        return false;
      }
      sum *= 7; // 7 is prime
      sum += index + 1;
    }
    sum %= alphabet.length;

    let checksum = alphabet[sum];
    return key[20] === checksum;
  } catch (e) {
    return false;
  }
}

const createWindow = async () => {
  if (!disableUpdater) {
    try {
      autoUpdater.checkForUpdates();
      setInterval(function () {
        try {
          if (!disableUpdater) {
            autoUpdater.checkForUpdates();
          }
        } catch (err) {
          logger.warn("autoupdate failed");
          logger.warn(err);
        }
      }, 1000 * 60 * 10);
    } catch (err) {
      disableUpdater = true;
      logger.error(err);
    }
  }

  protocol.registerFileProtocol("vipfy", vipfyHandler, error => {
    if (error) {
      logger.error("Failed to register vipfy protocol", error);
    }
  });

  session.fromPartition("services").protocol.registerFileProtocol("vipfy", vipfyHandler, error => {
    if (error) {
      logger.error("Failed to register vipfy protocol", error);
    }
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: "src/images/logo_weis.png",
    show: false,
    center: true,
    title: "Vipfy",
    titleBarStyle: "hiddenInset",
    fullscreenable: true,
    backgroundColor: "#253647",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false,
      webviewTag: true
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.webContents.on("did-fail-load", (event, code, desc, url, isMainFrame) => {
      logger.warn(`failed loading; ${isMainFrame} ${code} ${url}`, event);
    });
    mainWindow.webContents.setZoomFactor(1.0);
    mainWindow.show();
  });

  // and load the index.html of the app.
  // mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if (isDevMode) {
    try {
      await installExtension(REACT_DEVELOPER_TOOLS);
    } catch (err) {
      console.log(err);
    }
    try {
      await installExtension(REACT_PERF);
    } catch (err) {
      console.log(err);
    }
    try {
      await installExtension(APOLLO_DEVELOPER_TOOLS);
    } catch (err) {
      console.log(err);
    }
    openDevTools(mainWindow.webContents.id);
  }

  mainWindow.on("close", async () => {
    try {
      await mainWindow.webContents.executeJavaScript("window.logout()");
      await mainWindow.webContents.executeJavaScript("localStorage.clear()");
      mainWindow.webContents.session.clearStorageData();
      session.fromPartition("services").clearStorageData();
    } catch (err) {
      logger.error(err);
    }
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on("will-resize", (e, newBounds) => fixDevToolSize(newBounds));

  mainWindow.on("maximize", e => {
    const bounds = mainWindow.getContentBounds(); // window bounds are larger than window to hide border in maximized state (on windows at least)
    fixDevToolSize(bounds);
  });
  mainWindow.on("unmaximize", e => {
    const bounds = mainWindow.getBounds();
    fixDevToolSize(bounds);
  });
};

function fixDevToolSize(newBounds) {
  // autoresize is buggy, so we do our own
  if (!devtools || devtools.isDestroyed()) return;
  devtools.setBounds({
    x: newBounds.width - 600,
    y: 64,
    width: 600,
    height: newBounds.height - 64
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", async () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

let containerWithDevToolsOpen: Electron.WebContents | null = null;

function closeDevTools() {
  if (devtools && !devtools.isDestroyed()) {
    if (containerWithDevToolsOpen && !containerWithDevToolsOpen.isDestroyed()) {
      containerWithDevToolsOpen.closeDevTools();
    }
    containerWithDevToolsOpen = null;
    mainWindow.removeBrowserView(devtools);
    devtools.destroy();
    devtools = null;
  }
}

function openDevTools(webContentId) {
  closeDevTools();
  devtools = new BrowserView();
  mainWindow.addBrowserView(devtools);
  const bounds = mainWindow.getContentBounds();
  fixDevToolSize(bounds);

  const container = webContents.fromId(webContentId);
  container.setDevToolsWebContents(devtools.webContents);
  //container.debugger.attach();
  container.openDevTools({ mode: "detach" });
  containerWithDevToolsOpen = container;
  console.log(devtools.getBounds());
}

ipcMain.handle("openDevTools", e => {
  if (mainWindow === null) {
    return;
  }
  mainWindow.webContents.executeJavaScript(`
    (function(){
      let app = document.querySelector("#App");
      app.style.marginRight = "600px";
      let dt = document.querySelector("#DevToolToolBar");
      dt.style.display = "block";
    })();
    `);
  openDevTools(mainWindow.webContents.id);
});

ipcMain.handle("changeDevTools", (e, id: number) => {
  if (mainWindow === null) {
    return;
  }
  console.log("changeDevTools", id);
  if (id == -1) {
    id = mainWindow.webContents.id;
  }
  openDevTools(id);
});

ipcMain.handle("getDevToolsContentId", e => {
  if (!containerWithDevToolsOpen || containerWithDevToolsOpen.isDestroyed()) {
    closeDevTools();
    return null;
  }
  const id = containerWithDevToolsOpen.id;
  if (id == mainWindow.webContents.id) {
    return -1;
  }
  return id;
});

ipcMain.handle("closeDevTools", e => {
  mainWindow.webContents.executeJavaScript(`
    (function(){
      let app = document.querySelector("#App");
      app.style.marginRight = "0";
      let dt = document.querySelector("#DevToolToolBar");
      dt.style.display = "none";
    })();
    `);
  closeDevTools();
});

ipcMain.handle("getMainWindowPosition", e => {
  if (mainWindow === null) {
    return null;
  }

  return mainWindow.getPosition();
});

ipcMain.on("getMainWindowPositionSync", e => {
  if (mainWindow === null) {
    e.returnValue = null;
    return;
  }

  e.returnValue = mainWindow.getPosition();
});

ipcMain.handle("getMainWindowContentBounds", e => {
  if (mainWindow === null) {
    return null;
  }

  return mainWindow.getContentBounds();
});

ipcMain.on("getMainWindowContentBoundsSync", e => {
  if (mainWindow === null) {
    e.returnValue = null;
    return;
  }

  e.returnValue = mainWindow.getContentBounds();
});
