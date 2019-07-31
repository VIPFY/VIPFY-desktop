import * as React from "react";
import UniversalButton from "../components/universalButtons/universalButton";

//this error page is shown to logged in users. For logged out users, see ../error.tsx
export default props => (
  <div id="outer-error-page">
    <h1>Sorry an error occurred!</h1>
    <img
      src="./images/sso_creation_fail.png"
      width={621}
      height={390}
      style={{ marginTop: "80px", marginBottom: "74px" }}
    />
    <p>
      Please restart VIPFY. If the problem persists, please contact our support with details on the
      exact steps that lead you to this page
    </p>

    <UniversalButton
      label="Contact Support"
      type="high"
      customStyles={{
        marginTop: "72px",
        fontSize: "24px",
        fontWeight: "bold",
        padding: "7px 20px"
      }}
      onClick={() => (window.location.href = "mailto:support@vipfy.store")}
    />
  </div>
);
