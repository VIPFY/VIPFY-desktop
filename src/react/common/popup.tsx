import * as React from "react";

interface Props {
  popupBody: any;
  popupHeader: string;
  bodyProps: object;
  onClose: function;
}

class Popup extends React.Component<Props> {
  keyboardListener = event => {
    if (event.key === "Escape" || event.keyCode === 27) {
      this.props.onClose();
    }
  };

  componentDidMount() {
    if (this.props.onClose) {
      window.addEventListener("keydown", this.keyboardListener, true);
    }
  }

  componentWillUnmount() {
    if (this.props.onClose) {
      window.removeEventListener("keydown", this.keyboardListener, true);
    }
  }

  render() {
    const { popupBody, bodyProps, popupHeader, close } = this.props;
    const PopupBody = popupBody;

    return (
      <div id="overlay">
        <div id="popup">
          <div id="popup-header">
            <div id="popup-header-text">{popupHeader}</div>
            <div id="popup-close-button" onClick={close}>
              <i className="fas fa-times" />
            </div>
          </div>

          <PopupBody {...bodyProps} />
        </div>
      </div>
    );
  }
}

export default Popup;
