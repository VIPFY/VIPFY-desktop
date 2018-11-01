import { app, BrowserWindow, autoUpdater, dialog, protocol, session } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  APOLLO_DEVELOPER_TOOLS
} from "electron-devtools-installer";
import { enableLiveReload } from "electron-compile";
import path = require("path");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const DOMAIN = "https://storage.googleapis.com/releases.vipfy.store";
const suffix =
  process.platform === "darwin" ? `/RELEASES.json?method=JSON&version=${app.getVersion()}` : "";
autoUpdater.setFeedURL({
  url: `${DOMAIN}/VIPFY/98c61756053f11b6429ce49805bd7553/${process.platform}/${
    process.arch
  }${suffix}`,
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

  dialog.showMessageBox(dialogOpts, response => {
    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

let isDevMode = !!process.execPath.match(/[\\/]electron/);

const vipfyHandler = (request, callback) => {
  const url = request.url.substr(8);
  //callback({path: path.normalize(`${__dirname}/${url}`)})

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

const createWindow = async () => {
  try {
    autoUpdater.checkForUpdates();
  } catch (err) {
    console.error(err);
    console.error("you can ignore that error if this is run from source");
    console.log("reverting to devmode");
    isDevMode = true;
  }

  if (isDevMode) {
    enableLiveReload({ strategy: "react-hmr" });
  }

  protocol.registerFileProtocol("vipfy", vipfyHandler, error => {
    if (error) {
      console.error("Failed to register vipfy protocol");
    }
  });

  session.fromPartition("services").protocol.registerFileProtocol("vipfy", vipfyHandler, error => {
    if (error) {
      console.error("Failed to register vipfy protocol");
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
    frame: false
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    await installExtension(APOLLO_DEVELOPER_TOOLS);
    // mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
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
