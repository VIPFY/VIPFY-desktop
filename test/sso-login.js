const hooks = require("./hooks");
const SsoLoginPage = require("./pageObject/sso-login.page");

describe("Application launch", function () {
  this.timeout(20000);
  let app;

  beforeEach(async function () {
    app = await hooks.startApp();
  });

  afterEach(async function () {
    await hooks.stop(app);
  });

  it("executes an sso login to all apps in list. slow.", async function () {
    await app.client.waitUntilWindowLoaded();
    await app.client.url(SsoLoginPage.url);
    await app.client.click(SsoLoginPage.startBatchRunIcon);

    return true;
  });
});
