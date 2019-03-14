import * as React from "react";

interface Props {
  popupBody: any;
  popupHeader: string;
  bodyProps: object;
  onClose: any;
  info: string;
  type: string;
}

interface State {}

class Popup extends React.Component<Props, State> {
  render() {
    const { popupBody, bodyProps, popupHeader, onClose, type, info } = this.props;
    const PopupBody = popupBody;

    if (type == "pic") {
      return (
        <div id="overlay" onClick={onClose}>
          <div id="popup-pic">
            <PopupBody {...bodyProps} onClose={onClose} />
          </div>
        </div>
      );
    } else {
      return (
        <div id="overlay">
          <div id="popup">
            <div id="popup-header">
              <div id="popup-header-text">{popupHeader}</div>
              <div id="popup-close-button" onClick={onClose}>
                <i className="fas fa-times" />
              </div>
            </div>

            <div className="popup-body-wrapper" style={bodyProps.style ? bodyProps.style : {}}>
              {info && info !== "" ? <div id="popup-info">{info}</div> : ""}
              <PopupBody {...bodyProps} onClose={onClose} />
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Popup;
