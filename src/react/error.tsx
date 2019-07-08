import * as React from "react";
import UniversalButton from "./components/universalButtons/universalButton";

interface Props {
  children: any;
}

interface State {
  isError: boolean;
}

/**
 * Show an error page to a logged out user
 */
class OuterErrorBoundary extends React.Component<Props, State> {
  // Apollo is available, but nothing else. This is mounted before the router.

  state: State = {
    isError: false
  };

  componentDidCatch(error, info) {
    console.log("ERROR", error, info);
    this.setState({ isError: true });
  }

  render() {
    if (!this.state.isError) {
      return React.Children.only(this.props.children);
    } else {
      return (
        <div id="outer-error-page">
          <h1>Sorry an error occurred!</h1>
          <img
            src="images/sso_creation_fail.png"
            width={621}
            height={390}
            style={{ marginTop: "80px", marginBottom: "74px" }}
          />
          <p>
            Please restart VIPFY. If the problem persists, please contact our support with details
            on the exact steps that lead you to this page
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
    }
  }
}

export default OuterErrorBoundary;
