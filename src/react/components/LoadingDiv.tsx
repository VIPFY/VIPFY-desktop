import * as React from "react";

export default ({ text, legalText = "Vipfy loves you" }) => (
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
