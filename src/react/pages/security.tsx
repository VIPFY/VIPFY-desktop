import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";
import UniversalSearchBox from "../components/universalSearchBox";
import Collapsible from "../common/Collapsible";

interface Props {
  showPopup: Function;
  history: any;
  client: any;
}

interface State {
  search: string;
}

export const SecurityContext = React.createContext();

class Security extends React.Component<Props, State> {
  state = { search: "" };

  securityRef = React.createRef<HTMLTextAreaElement>();

  render() {
    return (
      <SecurityContext.Provider value={{ history: this.props.history, client: this.props.client }}>
        {
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
        }
      </SecurityContext.Provider>
    );
  }
}

export default Security;
