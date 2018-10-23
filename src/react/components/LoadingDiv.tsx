import * as React from "react";

export default ({
  text = "Vipfy loves you",
  legalText = "Legal legal legal",
  style
}: {
  text?: string;
  legalText?: string;
  style?: object;
}) => (
  <div id="loading-screen" className="mainPosition" style={style}>
    <div className="loadingTextBlock">
      {/*<div className="centerText inspirationalText">
        <div>{text}</div>
      </div>
      <div className="centerText legalText">
        <div>{legalText}</div>
</div>*/}
    </div>
  </div>
);
