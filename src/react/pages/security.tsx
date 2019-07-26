import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";
import UniversalSearchBox from "../components/universalSearchBox";
import Collapsible from "../common/Collapsible";

interface Props {
  showPopup: Function;
}

interface State {
  search: string;
}

class Security extends React.Component<Props, State> {
  state = { search: "" };

  securityRef = React.createRef<HTMLTextAreaElement>();

  render() {
    return (
      <div className="managerPage">
        <div className="heading">
          <h1>Security</h1>
          <UniversalSearchBox getValue={v => this.setState({ search: v })} />
        </div>

        <Collapsible child={this.securityRef} title="Overview">
          <div ref={this.securityRef}>
            <UserSecurityTable search={this.state.search} />
          </div>
        </Collapsible>
      </div>
    );
  }
}

export default Security;
