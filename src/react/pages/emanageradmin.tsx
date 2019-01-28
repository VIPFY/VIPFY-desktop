import * as React from "react";

interface Props {}

interface State {
  show: Boolean;
}

class EManagerAdmin extends React.Component<Props, State> {
  state = {
    show: true
  };

  render() {
    return <div className="adminToolHolder">TESTTEST</div>;
  }
}

export default EManagerAdmin;
