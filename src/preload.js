const con = require('electron').remote.getGlobal('console');

const scripts = {
  "(www.)?vipfy.com": "vipfy.ts",
  "(www.)?dropbox.com": "dropbox.ts",
}

const hostname = window.location.hostname;

let script = ""
for (const domain in scripts) {
  if(new RegExp(domain).test(hostname)) {
    script = scripts[domain]
    break
  }
}

con.log(script);

if(script == "") {
  con.log(`No Script for ${hostname}`);
} else {
  try {
    require(`./locationScripts/${script}`)();
    con.log(`Executed Script for ${hostname}`);
  } catch(e) {
    con.log(e.stack);
    con.log(`Executed Script for ${hostname}`);
  }
}