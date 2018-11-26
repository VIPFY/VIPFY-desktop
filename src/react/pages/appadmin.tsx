import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";

interface Props {
  showPopup: Function;
}

interface State {
  show: Boolean;
}

class AppAdmin extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  render() {
    return (
      <div id="billing-page">
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            />
            <span>Overview</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">Testing</div>
          </div>
        </div>
      </div>
    );
  }
}

export default AppAdmin;
