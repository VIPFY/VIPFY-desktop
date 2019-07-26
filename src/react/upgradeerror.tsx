import * as React from "react";
import { shell } from "electron";
import UniversalButton from "./components/universalButtons/universalButton";

/**
 * Show an error page to a logged out user
 */
class UpgradeError extends React.Component<Props, State> {
  // Apollo is available, but nothing else. This is mounted before the router.

  state: State = {
    isError: false
  };

  componentDidCatch(error, info) {
    console.log("ERROR", error, info);
    this.setState({ isError: true });
  }

  render() {
    return (
      <div style={{ width: "100vw", height: "calc(100vh - 32px", overflowY: "scroll" }}>
        <div id="outer-error-page">
          <h1>Sorry an error occurred!</h1>
          <img
            src="images/sso_creation_fail.png"
            width={621}
            height={390}
            style={{ marginTop: "80px", marginBottom: "74px" }}
          />
          <p>
            Make sure you have the latest version of your VIPFY App. You can update your version
            with the following link:
            <br />
            <br />
            <UniversalButton
              label="www.vipfy.store/update"
              type="low"
              customStyles={{ textTransform: "lowercase", fontSize: "24px" }}
              onClick={() => shell.openExternal("https://www.vipfy.store/update")}
            />
          </p>
          <p style={{ marginTop: "32px" }}>
            If the problem persists, please contatct our support with details on the exact steps
            that lead you to this page.
          </p>

          <UniversalButton
            label="Contact Support"
            type="high"
            customStyles={{
              marginTop: "40px",
              fontSize: "24px",
              fontWeight: "bold",
              padding: "7px 20px"
            }}
            onClick={() => (window.location.href = "mailto:support@vipfy.store")}
          />
        </div>
      </div>
    );
  }
}

export default UpgradeError;
