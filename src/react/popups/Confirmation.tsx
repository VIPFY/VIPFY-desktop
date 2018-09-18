import * as React from "react";

export default props => (
  <div className="confirmation-dialog">
    <h1>{`Do you really want to delete this ${props.type}?`}</h1>
    <div className="generic-button-holder">
      <button type="button" className="generic-cancel-button" onClick={props.onClose}>
        <i className="fas fa-long-arrow-alt-left" /> Cancel
      </button>

      <button
        type="submit"
        className="generic-submit-button"
        onClick={async () => {
          await props.submitFunction(props.id);
          props.onClose();
        }}>
        <i className="fas fa-check-circle" /> Submit
      </button>
    </div>
  </div>
);
