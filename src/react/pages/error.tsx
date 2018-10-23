import * as React from "react";

//this error page is shown to logged in users. For logged out users, see ../error.tsx
export default props => (
  <div id="error-page">
    <h1>Sorry, an error occurred</h1>
    <p style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto", maxWidth: "50em" }}>
      If the problem persists, please contact support with details on the exact steps that lead you
      to this page
    </p>
  </div>
);
