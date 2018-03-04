Vipfy-Desktop
-------------
![status](https://img.shields.io/badge/Status-%20Ready%20for%20Awesome-red.svg)

A user-facing app for displaying the vipfy marketplace, as well as logging users into the various services they bought while modifying those services to fit into our offering.

# How to run

```bash
npx electron-forge start
```

# How to package

```bash
npx electron-forge package --platform=win32
npx electron-forge package --platform=darwin
npx electron-forge package --platform=linux
```

# Architecture

The frontend is written with react and typescript.

Most of the screen space is taken up by a webview displaying the vipfy marketplace (provided by vipfy-frontend) or the used service. The webview is modified by a preload script which runs before the site's javascript (one of the scripts in locationScripts is chosen by preload.ts)

This project is purely a frontend that calls to vipfy-backend for backend needs.