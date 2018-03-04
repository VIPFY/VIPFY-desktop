//bootstrap electron-compile to get typescript compilation going, the load real preload script

const { remote } = require('electron');

require('electron-compile/lib/initialize-renderer').initializeRendererProcess(remote.getGlobal('globalCompilerHost').readOnlyMode);

require('./preload');