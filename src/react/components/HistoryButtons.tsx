import * as React from "react";
import * as ReactDOM from "react-dom";

interface Props {
  viewID: number;
}

interface State {}

const header = document.getElementById("header-arrows")!;

export default (props: Props) => ReactDOM.createPortal(<HistoryButtons {...props} />, header);

class HistoryButtons extends React.Component<Props, State> {
  backFunction() {
    if (
      this.props.viewID != -1 &&
      document.querySelector(`#webview-${this.props.viewID} webview`) &&
      document.querySelector(`#webview-${this.props.viewID} webview`)!.canGoBack()
    ) {
      document.querySelector(`#webview-${this.props.viewID} webview`)!.goBack();
    } else {
      history.back();
    }
  }

  forwardFunction() {
    if (
      this.props.viewID != -1 &&
      document.querySelector(`#webview-${this.props.viewID} webview`) &&
      document.querySelector(`#webview-${this.props.viewID} webview`)!.canGoForward()
    ) {
      document.querySelector(`#webview-${this.props.viewID} webview`)!.goForward();
    } else {
      history.forward();
    }
  }

  render() {
    return (
      <>
        <button
          type="button"
          className="naked-button historyButton"
          onClick={() => this.backFunction()}>
          <i className="fal fa-long-arrow-left" />
        </button>
        <button
          type="button"
          className="naked-button historyButton"
          onClick={() => this.forwardFunction()}>
          <i className="fal fa-long-arrow-right" />
        </button>
      </>
    );
  }
}
