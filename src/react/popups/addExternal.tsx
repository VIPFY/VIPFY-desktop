import * as React from "react";
import { Query } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";
import { randomPassword } from "../common/passwordgen";
import GenericInputField from "../components/GenericInputField";
import { FETCH_ALL_BOUGHTPLANS } from "../queries/billing";

interface Props {
  onClose: Function;
  needsubdomain?: boolean | false;
  appname: string;
  addAccount: Function;
  appid: number;
  showloading: boolean;
  options: any;
}

interface State {
  showpwchange: boolean;
  showPlans: boolean;
  showsubdomain: boolean;
  accountdetails: boolean;
  boughtplanid: number;
  alias: string;
  showPlanFields: boolean;
  pw1: string;
  pw2: string;
  pw3: string;
  username: string;
  password: string;
  subdomain: string;
  focus: number;
  options?: Object;
}

class ShowEmployee extends React.Component<Props, State> {
  state = {
    showpwchange: false,
    showPlans: true,
    showsubdomain: true,
    showPlanFields: false,
    accountdetails: true,
    boughtplanid: 0,
    alias: "",
    pw1: "",
    pw2: "",
    pw3: "",
    username: "",
    password: "",
    subdomain: "",
    focus: 0
  };

  componentDidMount = async () => {
    const pw1 = await randomPassword();
    const pw2 = await randomPassword();
    const pw3 = await randomPassword();
    this.setState({ pw1, pw2, pw3 });
  };

  toggleField = (name: keyof State): void =>
    this.setState(prevState => ({ ...prevState, [name]: !prevState[name] }));

  onEnter = async fieldid => {
    await this.setState({ focus: fieldid });
  };

  addAccountTHIS = () => {
    if (this.props.needsubdomain && this.props.options) {
      this.props.addAccount(
        this.state.username,
        this.state.password,
        `${this.props.options.predomain}${this.state.subdomain}${this.props.options.afterdomain}`,
        this.props.appid
      );
    } else {
      this.props.addAccount(
        this.state.username,
        this.state.password,
        this.state.subdomain,
        this.props.appid
      );
    }
  };

  render() {
    const { clipboard } = require("electron");
    const { options, appid } = this.props;
    const { username, password, pw1, pw2, pw3, showPlanFields } = this.state;
    console.log("P", this.state);
    const passwordProposals = [pw1, pw2, pw3];
    let step = 1;

    const fieldsCheck =
      username &&
      username !== "" &&
      password &&
      password !== "" &&
      (this.state.subdomain != "" || this.state.boughtplanid > 0);

    if (this.props.showloading) {
      return <h3>Adding your account</h3>;
    }

    return (
      <React.Fragment>
        <h3>
          {`Some simple steps to integrate your existing account for ${
            this.props.appname
          } into Vipfy`}
        </h3>
        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleField("showpwchange")}>
            <i
              className={`button-hide fas fa-angle-${this.state.showpwchange ? "left" : "down"}`}
            />
            <span>{`Step ${step++}: Change your password to a non-standad secure one`}</span>
          </div>

          <div className={`inside ${this.state.showpwchange ? "in" : "out"}`}>
            <div className="inside-padding">
              <h4>
                Please login into your existing account and change the password to a secure one.
              </h4>
              <h4 style={{ color: "#c73544" }}>
                Do not use one of your standard passwords nor a weak one (e.g. 1234)
              </h4>
              <h5>Some good examples are:</h5>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {passwordProposals.map((pw, key) => (
                  <span
                    key={key}
                    className="pwexample"
                    title="Click to copy to clipboard"
                    onClick={() => clipboard.writeText(pw)}>
                    {pw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleField("showPlans")}>
            <i className={`button-hide fas fa-angle-${this.state.showPlans ? "left" : "down"}`} />
            <span>{`Step ${step++}: Choose a Team`}</span>
          </div>
          <Query query={FETCH_ALL_BOUGHTPLANS} variables={{ appid, external: true }}>
            {({ data, error, loading }) => {
              if (loading) {
                return <LoadingDiv text="Fetching Plans..." />;
              }
              if (error || !data) {
                return <ErrorComp error={filterError(error)} />;
              }

              return (
                <div className={`inside ${this.state.showPlans ? "in" : "out"}`}>
                  <div className="inside-padding">
                    {data.fetchAllBoughtPlansFromCompany.length > 0 ? (
                      <h5>Choose one of the existing teams:</h5>
                    ) : (
                      ""
                    )}

                    <div className="team-app-holders">
                      {data.fetchAllBoughtPlansFromCompany.length > 0
                        ? data.fetchAllBoughtPlansFromCompany.map(item => (
                            <button
                              className={`bought-plan ${
                                showPlanFields
                                  ? "disabled-button"
                                  : this.state.boughtplanid == item.id
                                  ? "selected"
                                  : ""
                              }`}
                              key={item.id}
                              disabled={showPlanFields}
                              onClick={() => this.setState({ boughtplanid: item.id })}>
                              <img
                                className="right-profile-image"
                                style={{ float: "left" }}
                                src={`https://storage.googleapis.com/vipfy-imagestore-01/icons/${item
                                  .plan.app.icon || "21352134123123-vipfy-fdgd43asfa"}`}
                              />
                              <div className="employeeName">
                                {item.alias ? item.alias : item.plan.app.name} {item.id}
                              </div>
                            </button>
                          ))
                        : ""}
                    </div>

                    {data.fetchAllBoughtPlansFromCompany.length > 0 ? (
                      <h5 style={{ marginTop: "14px" }}>Create a new one:</h5>
                    ) : (
                      ""
                    )}
                    <button
                      onClick={() =>
                        this.setState(prevState => ({ showPlanFields: !prevState.showPlanFields }))
                      }
                      className="naked-button genericButton"
                      style={{
                        backgroundColor: showPlanFields ? "rgb(199, 53, 68)" : "#20BAA9"
                      }}>
                      <span className="textButton">
                        <i className={`fal fa-${showPlanFields ? "minus" : "plus"}`} />
                      </span>
                      <span className="textButtonBeside">
                        {showPlanFields ? "Cancel" : "Create new Team"}
                      </span>
                    </button>
                    {showPlanFields ? (
                      <React.Fragment>
                        <div
                          className="inside-padding float-in-left"
                          style={{ display: "flex", justifyContent: "space-around" }}>
                          <div className="field" style={{ width: "20em" }}>
                            <div className="label">Teamname:</div>
                            <input
                              className="inputBoxField inputBoxUnderline"
                              name="alias"
                              value={this.state.alias}
                              placeholder={this.props.appname}
                              onChange={e => this.setState({ alias: e.target.value })}
                            />
                          </div>
                          {this.props.needsubdomain ? (
                            <div
                              className="inside-padding float-in-left"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "flex-end"
                              }}>
                              <div className="domainAroundLeft">
                                {options ? options.predomain : ""}
                              </div>
                              <div className="field" style={{ width: options ? "10em" : "20em" }}>
                                <div className="label">Subdomain:</div>
                                <GenericInputField
                                  fieldClass={`inputBoxField inputBoxUnderline ${
                                    options ? "textRight" : ""
                                  }`}
                                  divClass=""
                                  placeholder="Your subdomain"
                                  onBlur={value => this.setState({ subdomain: value })}
                                  focus={this.state.focus === 1}
                                  onEnter={() => this.onEnter(2)}
                                  onClick={() => this.onEnter(1)}
                                />
                              </div>
                              <div className="domainAroundRight">
                                {options ? options.afterdomain : ""}
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </React.Fragment>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              );
            }}
          </Query>
        </div>

        <div className="genericHolder">
          <div className="header" onClick={() => this.toggleField("accountdetails")}>
            <i
              className={`button-hide fas fa-angle-${this.state.accountdetails ? "left" : "down"}`}
            />
            <span>{`Step ${step++}: Enter your account details`}</span>
          </div>
          <div className={`inside ${this.state.accountdetails ? "in" : "out"}`}>
            <div
              className="inside-padding"
              style={{ display: "flex", justifyContent: "space-around" }}>
              <div className="field" style={{ width: "20em" }}>
                <div className="label">Username / Email:</div>
                <GenericInputField
                  fieldClass="inputBoxField inputBoxUnderline"
                  divClass=""
                  placeholder="Please insert your username/email"
                  onBlur={value => this.setState({ username: value })}
                  focus={this.state.focus === 2}
                  onEnter={() => this.onEnter(3)}
                  onClick={() => this.onEnter(2)}
                />
              </div>
              <div className="field" style={{ width: "20em" }}>
                <div className="label">Password:</div>
                <GenericInputField
                  fieldClass="inputBoxField inputBoxUnderline"
                  divClass=""
                  placeholder="Please insert your password"
                  type="password"
                  onBlur={value => this.setState({ password: value })}
                  onChange={value => this.setState({ password: value })}
                  focus={this.state.focus === 3}
                  onEnter={() => this.addAccountTHIS()}
                  onClick={() => this.onEnter(3)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="centerText">
          <button
            className="naked-button genericButton"
            onClick={() => this.props.onClose()}
            style={{ marginRight: "0.5em", backgroundColor: "#c73544" }}>
            <span className="textButton">
              {/*<i className="fal fa-long-arrow-alt-left" />*/}
              <i className="fal fa-times" />
            </span>
            <span className="textButtonBesideLeft">Cancel</span>
          </button>

          <button
            className="naked-button genericButton"
            onClick={() => this.addAccountTHIS()}
            style={{
              marginLeft: "0.5em",
              backgroundColor: fieldsCheck ? "" : "#c5c5c5"
            }}>
            <span className="textButton">
              <i className="fal fa-check" />
            </span>
            <span className="textButtonBeside">
              {fieldsCheck ? "Add Account" : "Please fill out all required fields"}
            </span>
          </button>
        </div>

        {/*<span className="heading">Do you want to delete {this.props.name}?</span>

        <div className="checkoutButton" onClick={() => this.props.closePopup()}>
          Cancel
        </div>
        <div className="checkoutButton" onClick={() => this.delEmp()}>
          Delete
    </div>*/}
      </React.Fragment>
    );
  }
}
export default ShowEmployee;
