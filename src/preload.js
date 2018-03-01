const con = require('electron').remote.getGlobal('console');

try {
  require(`./locationScripts/${window.location.hostname}.ts`)();
  con.log(`Executed Script for ${window.location.hostname}`);
} catch(e) {
  con.log(e.stack);
  con.log(`No Script for ${window.location.hostname}`);
}