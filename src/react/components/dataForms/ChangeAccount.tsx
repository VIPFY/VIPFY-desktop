import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";

interface Props {
  delete?: Boolean;
}

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
        <h1>{this.props.delete ? "Delete Account from this machine" : "Change Account"}</h1>
        <div className="accountArrayHolder">
          {this.accounts.map(a => (
            <div className="accountHolder">
              <div className="accountHolderBullet" style={{ backgroundColor: a.color }} />
              <div className="accountHolderText" style={{ paddingTop: "11px" }}>
                <div>{a.name}</div>
                <div style={{ fontSize: "12px" }}>{a.email}</div>
              </div>
              {this.props.delete ? <i className="fal fa-trash-alt accountDelete" /> : ""}
            </div>
          ))}
          {this.props.delete ? (
            ""
          ) : (
            <div className="accountHolder">
              <div className="accountHolderBullet">
                <i className="fal fa-user-plus" />
              </div>
              <div
                className="accountHolderText"
                style={{ lineHeight: "19px", paddingTop: "19px", fontSize: "14px" }}>
                Add account
              </div>
            </div>
          )}
          {this.props.delete ? (
            ""
          ) : (
            <div className="accountHolder">
              <div className="accountHolderBullet">
                <i className="fal fa-user-minus" />
              </div>
              <div
                className="accountHolderText"
                style={{ lineHeight: "19px", paddingTop: "19px", fontSize: "14px" }}>
                Delete account
              </div>
            </div>
          )}
        </div>
        {this.props.delete ? (
          <div className="buttonHolder" style={{ justifyContent: "flex-start" }}>
            <UniversalButton label="Cancel" type="low" />
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default ChangeAccount;
