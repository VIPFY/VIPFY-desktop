import * as React from "react";
import { ErrorPage } from "@vipfy-private/vipfy-ui-lib";

interface Props {
  children: any;
}

interface State {
  hasError: boolean;
}

/**
 * Show an error page to a logged out user whenever an uncaught error
 * happens in the child component tree.
 * Apollo is available, but nothing else. This is mounted before the router.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false
  };

  componentDidCatch(error, info) {
    console.error("ERROR", error, info);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }

    return React.Children.only(this.props.children);
  }
}
