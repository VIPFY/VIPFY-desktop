const {
  utils: { fromBuildIdentifier }
} = require("@electron-forge/core");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const fullPath = path.join(__dirname + "/package.json");
const packageJSON = fs.readFileSync(fullPath);

const { version } = JSON.parse(packageJSON);
const [major, minor, patch] = version.split(".");
const devVersion = `${major}.${minor}.${patch}-dev-${moment().format("LLL")}`;
console.log("FIRE: process.env.DEVELOPMENT", process.env.DEVELOPMENT);

module.exports = {
  buildIdentifier: process.env.DEVELOPMENT ? "dev" : "prod",
  packagerConfig: {
    icon: "iconTransparent",
    asar: false,
    appVersion: fromBuildIdentifier({ dev: devVersion, prod: version }),
    appCopyright: `©${new Date().getFullYear()} VIPFY GmbH`,
    osxSign: {
      platform: "darwin",
      type: "distribution",
      appVersion,
      "gatekeeper-assess": false,
      "hardened-runtime": true,
      entitlements: "./src/apple-shit/entitlement.plist",
      "entitlements-inherit": "./src/apple-shit/entitlement.plist",
      identity: "Developer ID Application: VIPFY GmbH (RD6VS27844)"
    }
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "vipfydesktop",
        iconUrl: "https://vipfy.store/favicon.ico",
        loadingGif: "./src/images/Ladeanimation_Vipfy_transparent.gif",
        setupIcon: "./iconTransparent.ico",
        // Yes, I am really doing this. Come up with a better solution if you
        // don't like it.
        [`${
          process.env.UNSIGNED ? "un" : ""
        }signWithParams`]: "/a /n VIPFY /tr http://timestamp.globalsign.com/?signature=sha2 /td SHA256"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["linux", "darwin", "win32"]
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: "./src/apple-shit/vipfy_logo_mac.icns",
        background: "./dmgBackground.png"
      }
    }
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/react/index.tsx",
              name: "main_window",
              prefixedEntries: ["./src/windowcontrols.js"]
            }
          ]
        }
      },
      "@electron-forge/plugin-auto-unpack-natives",
      {}
    ]
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-nucleus",
      config: {
        host: "http://release.vipfy.store:3030",
        appId: "1",
        channelId: process.env.CHANNEL_ID || "4e2105365ea5c7e823cb7af42450b29a",
        token: "4a3db0e625fbb3aec657f0e033bb8dd1"
      }
    }
  ],
  hooks: {
    postPackage: async () => {
      console.log(__dirname);
      return (await require("./src/apple-shit/notarize.js"))();
    }
  }
};
