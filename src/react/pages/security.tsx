import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";
import UniversalSearchBox from "../components/universalSearchBox";

interface Props {
  showPopup: Function;
}

interface State {
  show: boolean;
  search: string;
}

class Security extends React.Component<Props, State> {
  state = {
    show: true,
    search: ""
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  render() {
    return (
      <div className="managerPage">
        <div className="heading">
          <h1>Security</h1>
          <UniversalSearchBox getValue={v => this.setState({ search: v })} />
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggle()}>
            <i
              className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            />
            <span>Overview</span>
          </div>
          <div className={`inside ${this.state.show ? "in" : "out"}`}>
            <UserSecurityTable search={this.state.search} />
          </div>
        </div>
      </div>
    );
  }
}

export default Security;
