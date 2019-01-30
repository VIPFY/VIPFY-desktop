import * as React from "react";

interface Props {
  adminOpen: boolean;
}

interface State {
  show: Boolean;
}

class EShowerAdmin extends React.Component<Props, State> {
  state = {
    show: true
  };

  render() {
    return (
      <div className="adminToolHolder" style={{ right: this.props.adminOpen ? "0rem" : "-15rem" }}>
        TESTTEST
      </div>
    );
  }
}

export default EShowerAdmin;
