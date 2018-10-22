import * as React from "react";

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
          <h1>Sorry, an error occurred</h1>
          <p
            style={{
              textAlign: "center",
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: "50em"
            }}>
            Please restart VIPFY. If the problem persists, please contact support with details on
            the exact steps that lead you to this page
          </p>
        </div>
      );
    }
  }
}

export default OuterErrorBoundary;
