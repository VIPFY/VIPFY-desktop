import * as React from "react";
import UniversalButton from "../components/universalButtons/universalButton";
import { withRouter, RouteComponentProps } from "react-router";
import errorPic from "../../images/sso_creation_fail.png";

interface Props {
  history: any;
  children?: any;
}

//this error page is shown to logged in users. For logged out users, see ../error.tsx
class ErrorPage extends React.Component<Props & RouteComponentProps<{}>, null> {
  render() {
    return (
      <div id="outer-error-page" style={{ paddingTop: "10vh" }}>
        <h1>An error occurred. Sorry!</h1>
        <img
          src={errorPic}
          style={{ marginTop: "5vh", marginBottom: "5vh", height: "40vh", width: "auto" }}
        />
        <p>{this.props.children || "Please restart VIPFY."}</p>
        <p>
          If the problem persists, please contact our support with details on the exact steps that
          lead you to this page.
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
          onClick={() => this.props.history.push("support/fromError")}
        />
      </div>
    );
  }
}

export default withRouter(ErrorPage);
