import * as React from "react";

interface Props {
  style?: object;
  progress?: number;
}

export default ({ style, progress }: Props) => (
  <div id="loading-screen" className="mainPosition" style={style}>
    <div className="loadingTextBlock">
      {progress && <progress max="100" value={progress * 100} />}
    </div>
  </div>
);
