import * as React from "react";

export default ({
  text = "Vipfy loves you",
  legalText = "Legal legal legal",
  style,
  progress
}: {
  text?: string;
  legalText?: string;
  style?: object;
  progress?: number;
}) => (
    <div id="loading-screen" className="mainPosition" style={style}>
      <div className="loadingTextBlock">
        {progress && <progress max="100" value={progress*100} style={{position: "relative", left: "-3rem"}} />}
        {/*<div className="centerText inspirationalText">
        <div>{text}</div>
      </div>
      <div className="centerText legalText">
        <div>{legalText}</div>
</div>*/}
      </div>
    </div>
  );
