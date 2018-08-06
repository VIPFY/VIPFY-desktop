import * as React from "react";

interface Props {
  popupBody: any;
  popupHeader: string;
  bodyProps: object;
  onClose: function;
}

class Popup extends React.Component<Props> {
  render() {
    const { popupBody, bodyProps, popupHeader, onClose } = this.props;
    const PopupBody = popupBody;

    return (
      <div id="overlay">
        <div id="popup">
          <div id="popup-header">
            <div id="popup-header-text">{popupHeader}</div>
            <div id="popup-close-button" onClick={onClose}>
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
