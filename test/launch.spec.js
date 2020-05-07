describe("App Launch", function () {
  it("should launch the app", function () {
    return this.test.app.client
      .waitUntilWindowLoaded()
      .browserWindow.focus()
      .getWindowCount()
      .should.eventually.be.above(0)
      .browserWindow.isMinimized()
      .should.eventually.be.false.browserWindow.isVisible()
      .should.eventually.be.true.browserWindow.isFocused()
      .should.eventually.be.true.browserWindow.getBounds()
      .should.eventually.have.property("width")
      .and.be.above(0)
      .browserWindow.getBounds()
      .should.eventually.have.property("height")
      .and.be.above(0);
  });
});
