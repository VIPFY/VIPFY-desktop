import * as React from "react";

export default (props: {
  popupBody: any;
  popupHeader: string;
  bodyProps: object;
  onClose: any;
  info: string;
  type: string;
}): JSX.Element => {
  const { popupBody, bodyProps, popupHeader, onClose, type, info } = props;
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

          {info ? <div id="popup-info">{info}</div> : ""}
          <PopupBody {...bodyProps} onClose={onClose} />
        </div>
      </div>
    );
  }
};
