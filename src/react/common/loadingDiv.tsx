import * as React from "react";

export default ({ text }) => (
  <div className="loadingdiv">
    <img src={require("../../images/loading.gif")} id="loading" alt="Loading" />
    <div>{text}</div>
  </div>
);
