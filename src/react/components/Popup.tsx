import * as React from "react";

interface Props {
  popupBody: any;
  popupHeader: string;
  bodyProps: object;
  onClose: function;
}

export default props => {
  const { popupBody, bodyProps, popupHeader, onClose } = props;
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

        <PopupBody {...bodyProps} onClose={onClose} />
      </div>
    </div>
  );
};
