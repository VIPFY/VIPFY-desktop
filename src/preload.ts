{
  // tslint:disable:no-var-requires
  const con = require("electron").remote.getGlobal("console");
  const hostname = window.location.hostname;
  function hostMatches(domain: string) {
    return new RegExp(domain).test(hostname);
  }

  try {
    if (hostMatches("(www.)?vipfy.com")) {
      require("./locationScripts/vipfy.ts")();
    } else if (hostMatches("(www.)?dropbox.com")) {
      require("./locationScripts/dropbox.ts")();
    } else if (hostMatches(".*\.?pipedrive.com")) {
      require("./locationScripts/pipedrive.ts")();
    } else if (hostMatches(".*\.?wrike.com")) {
      require("./locationScripts/wrike.ts")();
    } else if (hostMatches(".*\.?google.com")) {
      require("./locationScripts/googledocs.ts")();
    } else {
      con.log(`No Script for ${hostname}`);
    }
    con.log(`Executed Script for ${hostname}`);
  } catch (e) {
    con.log(e.stack);
    con.log(`Executed Script for ${hostname}`);
  }
}