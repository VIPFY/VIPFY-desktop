import * as React from "react";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import CreateAccount from "./account";
import moment from "moment";

interface Props {
  orbit: any;
  continue: Function;
  accountFunction?: Function;
  leftSide?: JSX.Element;
}

interface State {
  newaccount: boolean;
  showall: boolean;
  newaccountname: string | null;
}

class AssignAccount extends React.Component<Props, State> {
  state = { newaccount: false, showall: false, newaccountname: null };

  render() {
    const allAccounts = this.props.accountFunction
      ? this.props.accountFunction(this.props.orbit)
      : this.props.orbit.licences;

    const accounts = allAccounts && allAccounts.filter(a => !a.options || !a.options.private);

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}>
          {this.props.leftSide || <span style={{ marginBottom: "2px" }}>Account:</span>}

          {!accounts || (accounts.length == 1 && !accounts[0]) ? (
            <UniversalButton
              label="Add new Account"
              onClick={() => this.setState({ newaccount: true })}
              type="high"
            />
          ) : (
            <UniversalDropDownInput
              id="orbit-search"
              label="Search for accounts"
              options={accounts}
              noFloating={true}
              resetPossible={true}
              width="300px"
              codeFunction={account => account.id}
              nameFunction={account => account.alias}
              renderOption={(possibleValues, i, click, value) => (
                <div
                  key={`searchResult-${i}`}
                  className="searchResult"
                  onClick={() => click(possibleValues[i])}>
                  <span className="resultHighlight">
                    {possibleValues[i].alias.substring(0, value.length)}
                  </span>
                  <span>{possibleValues[i].alias.substring(value.length)}</span>
                </div>
              )}
              alternativeText={inputelement => (
                <span
                  className="inputInsideButton"
                  style={{
                    width: "auto",
                    backgroundColor: "transparent",
                    cursor: "text"
                  }}>
                  <span
                    onClick={() => inputelement.focus()}
                    style={{ marginRight: "4px", fontSize: "12px" }}>
                    Start typing or
                  </span>
                  <UniversalButton
                    type="low"
                    tabIndex={-1}
                    onClick={() => {
                      this.setState({ showall: true });
                    }}
                    label="show all"
                    customStyles={{ lineHeight: "24px" }}
                  />
                </span>
              )}
              startvalue=""
              livecode={c => this.props.continue(accounts.find(a => a.id == c))}
              livevalue={v => this.setState({ newaccountname: v })}
              noresults="Add new account"
              noresultsClick={v => this.setState({ newaccount: true })}
              fewResults={true}
            />
          )}
        </div>
        {this.state.showall && (
          <PopupBase
            nooutsideclose={true}
            small={true}
            close={() => this.setState({ showall: false })}
            buttonStyles={{ justifyContent: "space-between" }}>
            <h1>All Accounts</h1>
            {accounts
              .filter(e => e.endtime >= moment.now() || e.endtime == null)
              .map(account => (
                <div className="listingDiv" key={account.id}>
                  <UniversalButton
                    type="low"
                    label={account.alias}
                    onClick={() => {
                      this.setState({ showall: false });
                      this.props.continue(account);
                    }}
                  />
                </div>
              ))}
            <div className="listingDiv" key="new">
              <UniversalButton
                type="low"
                label="Add new Account"
                onClick={() => this.setState({ newaccount: true, showall: false })}
              />
            </div>
            <UniversalButton type="low" label="Cancel" closingPopup={true} />
          </PopupBase>
        )}
        {this.state.newaccount && (
          <CreateAccount
            orbit={this.props.orbit}
            close={account => {
              this.props.continue(account);
              this.setState({ newaccount: false });
            }}
            alias={this.state.newaccountname}
          />
        )}
      </>
    );
  }
}
export default AssignAccount;
