import * as React from "react";

export default ({ text }) => (
  <div id="loadingScreen" className="mainPosition" style={{ display: "block" }}>
    <div className="loadingTextBlock">
      <div className="centerText inspirationalText">
        <div>{text}</div>
      </div>
      <div className="centerText legalText">
        <div>Vipfy loves you</div>
      </div>
    </div>
  </div>
);
