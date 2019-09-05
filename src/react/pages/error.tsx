import * as React from "react";
import UniversalButton from "../components/universalButtons/universalButton";
import { withRouter } from "react-router";

interface Props {
  history: any;
}

//this error page is shown to logged in users. For logged out users, see ../error.tsx
const ErrorPage = (props: Props) => (
  <div id="outer-error-page" style={{ paddingTop: "10vh" }}>
    <h1>Sorry an error occurred!</h1>
    <img
      src="./images/sso_creation_fail.png"
      style={{ marginTop: "5vh", marginBottom: "5vh", height: "40vh", width: "auto" }}
    />
    <p>
      Please restart VIPFY. If the problem persists, please contact our support with details on the
      exact steps that lead you to this page
    </p>

    <UniversalButton
      label="Contact Support"
      type="high"
      customStyles={{
        marginTop: "5vh",
        fontSize: "24px",
        fontWeight: "bold",
        padding: "7px 20px"
      }}
      onClick={() => props.history.push("support/fromError", { fromErrorPage: true })}
    />
  </div>
);

export default withRouter(ErrorPage);
