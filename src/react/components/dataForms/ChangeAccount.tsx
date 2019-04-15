import * as React from "react";

interface Props {}

interface State {}

class ChangeAccount extends React.Component<Props, State> {
  state: {};

  accounts = [
    { name: "Lisa Brödlin", email: "l.broedlin@gmail.com", color: "#5D76FF" },
    { name: "Nils Vossebein", email: "nv@vipfy.store", color: "#9C13BC" },
    { name: "Pascal Clanget", email: "pc@vipfy.store", color: "#FFC15D" },
    { name: "Jannis Froese", email: "jf@vipfy.store", color: "#FD8B29" }
  ];
  render() {
    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1>Change Account</h1>
        <div className="accountArrayHolder">
          {this.accounts.map(a => (
            <div className="accountHolder">
              <div className="accountHolderBullet" style={{ backgroundColor: a.color }} />
              <div className="accountHolderText" style={{ paddingTop: "11px" }}>
                <div>{a.name}</div>
                <div style={{ fontSize: "12px" }}>{a.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
export default ChangeAccount;
