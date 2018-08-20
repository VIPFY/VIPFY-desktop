import * as React from "react";

export default ({ text = "Vipfy loves you", legalText = "Legal legal legal" }) => (
  <div id="loadingScreen" className="mainPosition" style={{ display: "block" }}>
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
