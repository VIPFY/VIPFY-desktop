import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";

interface Props {
  showPopup: Function;
}

interface State {}

class Security extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div id="billing-page">
        <div className="payment-data-holder">
          <label className="payment-label">Users</label>
          <UserSecurityTable />
        </div>
      </div>
    );
  }
}

export default Security;
