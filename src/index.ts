import { app, BrowserWindow, autoUpdater, dialog } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS
} from "electron-devtools-installer";
import { enableLiveReload } from "electron-compile";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
  enableLiveReload({ strategy: "react-hmr" });
}

function initUpdates() {
  const DOMAIN = "http://release.vipfy.com:9999";
  const suffix =
    process.platform === "darwin"
      ? `/RELEASES.json?method=JSON&version=${app.getVersion()}`
      : "";
  autoUpdater.setFeedURL({
    url: `${DOMAIN}/vipfy-desktop/810e67d425a96eb8a85d68a03bd4c4ea/${
      process.platform
    }/${process.arch}${suffix}`,
    serverType: "json"
  });

  autoUpdater.on("checking-for-update", () => {});

  autoUpdater.on("update-available", () => {});

  autoUpdater.on("update-not-available", () => {});

  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail:
        "A new version has been downloaded. Restart the application to apply the updates."
    };

    dialog.showMessageBox(dialogOpts, response => {
      if (response === 0) {autoUpdater.quitAndInstall()};
    });
  });

  autoUpdater.checkForUpdates();
}

const createWindow = async () => {
  initUpdates();

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: "iconTransparent.png",
    show: false,
    center: true,
    title: "Vipfy",
    titleBarStyle: "hiddenInset"
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
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
