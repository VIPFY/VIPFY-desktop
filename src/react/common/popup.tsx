import * as React from "react";

interface Props {
  modalBody: any;
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
    const { modalBody, bodyProps, close } = this.props;
    const ModalBody = modalBody;

    return (
      <div id="overlay">
        <div id="popup">
          <div id="popup-header">
            <div id="popup-close-button" onClick={close}>
              <i className="fas fa-times" />
            </div>
          </div>

          <ModalBody {...bodyProps} />
        </div>
      </div>
    );
  }
}

export default Popup;
