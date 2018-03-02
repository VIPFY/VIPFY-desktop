const con = require('electron').remote.getGlobal('console');
con.log('1');
const hostname = window.location.hostname;
con.log('1');
function hostMatches(domain) {
  return new RegExp(domain).test(hostname);
}
con.log('1');
try {
  if (hostMatches('(www.)?vipfy.com')) {
    require('./locationScripts/vipfy.js')();
  } else if (hostMatches('(www.)?dropbox.com')) {
    require('./locationScripts/dropbox.js')();
  } else if (hostMatches('.*\.?pipedrive.com')) {
    require('./locationScripts/pipedrive.js')();
  } else {
    con.log(`No Script for ${hostname}`);
  }
  con.log(`Executed Script for ${hostname}`);
} catch (e) {
  con.log(e.stack);
  con.log(`Executed Script for ${hostname}`);
}