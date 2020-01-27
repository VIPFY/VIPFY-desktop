module.exports = {
  packagerConfig: {
    icon: "iconTransparent",
    asar: false,
    appCopyright: "©2018 VIPFY GmbH",
    osxSign: {
      platform: "darwin",
      type: "distribution",
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
        signWithParams: "/a /n VIPFY /tr http://timestamp.globalsign.com/?signature=sha2 /td SHA256"
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
        icon: "./iconTransparent.icns",
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
  ]
};
