import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";

interface Props {
  showPopup: Function;
}

interface State {
  show: Boolean;
}

class Security extends React.Component<Props, State> {
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
              //onClick={this.toggle}
            />
            <span>Security</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <div className="inside-padding">
              <UserSecurityTable />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Security;
