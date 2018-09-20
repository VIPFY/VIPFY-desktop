import * as React from "react";

export default ({ text = "Vipfy loves you", legalText = "Legal legal legal" }) => (
  <div id="loading-screen" className="mainPosition">
    <div className="loadingLogoHolder">
      <div className="loadingLogo" />
      <div className="loadingLogo loadingLogo2" />
    </div>
    <div className="loadingTextBlock">
      <div className="centerText inspirationalText">
        <div>{text}</div>
      </div>
      <div className="centerText legalText">
        <div>{legalText}</div>
      </div>
    </div>
  </div>
);
