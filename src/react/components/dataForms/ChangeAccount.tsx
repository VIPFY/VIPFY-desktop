import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import Store from "electron-store";
import EmployeePicture from "../EmployeePicture";

interface Props {
  addMachineUser: Function;
  backFunction: Function;
  selectAccount: Function;
  registerCompany: Function;
}

interface State {
  confirm: Boolean;
  deleteEmail: string;
  hover: string;
}

class ChangeAccount extends React.Component<Props, State> {
  state = {
    confirm: false,
    deleteEmail: "",
    hover: ""
  };

  accounts: any[] = [];

  deleteAccount() {
    let machineuserarray: {
      email: string;
      name: string;
      fullname: string;
    }[] = [];
    const store = new Store();

    if (store.has("accounts")) {
      machineuserarray = store.get("accounts");
      const i = machineuserarray.findIndex(u => u.email == this.state.deleteEmail);
      machineuserarray.splice(i, 1);
    }
    store.set("accounts", machineuserarray);
    this.setState({ deleteEmail: "" });
  }

  render() {
    const store = new Store();
    if (store.has("accounts")) {
      this.accounts = store.get("accounts");
      this.accounts.sort(function (a, b) {
        let nameA = a.fullname.toUpperCase();
        let nameB = b.fullname.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // namen müssen gleich sein
        return 0;
      });
    }

    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1 style={{ textAlign: "center" }}>Change Account</h1>

        <div className="accountArrayHolder">
          <div className="accountHolder" onClick={() => this.props.addMachineUser!()}>
            <div className="accountHolderBullet">
              <i className="fal fa-user-plus" />
            </div>
            <div
              className="accountHolderText"
              style={{
                lineHeight: "19px",
                paddingTop: "19px",
                fontSize: "14px"
              }}>
              Add account
            </div>
          </div>
          {this.accounts.length > 0 &&
            this.accounts.map(a => (
              <div
                key={a.email}
                className="accountHolder"
                onMouseEnter={() => this.setState({ hover: a.email })}
                onMouseLeave={() => this.setState({ hover: "" })}
                onClick={() => this.props.selectAccount(a.email)}>
                <EmployeePicture employee={a} className="accountHolderBullet" size={20} />
                <div
                  className="accountHolderText"
                  style={{ paddingTop: "11px", maxWidth: "210px" }}>
                  <div>{a.fullname}</div>
                  <div style={{ fontSize: "12px" }}>{a.email}</div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    this.setState({ confirm: true, deleteEmail: a.email });
                  }}
                  className="naked-button">
                  <i className="fal fa-trash-alt accountDelete" />
                </button>
              </div>
            ))}
        </div>
        <div className="buttonHolder">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.backFunction()} />

          <UniversalButton
            label="Register Company"
            type="high"
            onClick={() => this.props.registerCompany()}
          />
        </div>

        {this.state.confirm && (
          <PopupBase small={true} close={() => this.setState({ confirm: false })} noSidebar={true}>
            <h1>Delete Account from Machine</h1>
            <p>Do you really want to delete this account from this machine?</p>
            <UniversalButton
              type="low"
              onClick={() => this.setState({ confirm: false })}
              label="Cancel"
            />
            <UniversalButton
              type="low"
              closingAllPopups={true}
              label="Delete"
              onClick={async () => this.deleteAccount()}
            />
          </PopupBase>
        )}
      </div>
    );
  }
}
export default ChangeAccount;
