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
  error: string;
  success: boolean;
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
    error: "",
    success: false
  };

  componentDidMount = async () => {
    const pw1 = await randomPassword();
    const pw2 = await randomPassword();
    const pw3 = await randomPassword();
    this.setState({ pw1, pw2, pw3 });
  };

  toggleField = (name: keyof State): void =>
    this.setState(prevState => ({ ...prevState, [name]: !prevState[name] }));

  addAccountTHIS = async (): Promise<any> => {
    try {
      const { username, password, subdomain, boughtplanid, alias } = this.state;
      const { appid, options } = this.props;
      const args = { username, password, alias, boughtplanid, appid, subdomain };

      if (this.props.needsubdomain) {
        args.subdomain = `${options.predomain}${subdomain}${options.afterdomain}`;
      }

      await this.props.addAccount({ ...args });
      this.setState({ success: true });
    } catch (error) {
      this.setState({ error: filterError(error) });
    }
  };

  render() {
    const { clipboard } = require("electron");
    const { options, appid, showloading } = this.props;
    const { username, password, pw1, pw2, pw3, subdomain, showPlanFields } = this.state;

    const passwordProposals = [pw1, pw2, pw3];
    let step = 1;

    const fieldsCheck =
      username &&
      username !== "" &&
      password &&
      password !== "" &&
      (subdomain ? subdomain != "" : true) &&
      (showPlanFields ? true : this.state.boughtplanid > 0);

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
            <span>{`Step ${step++}: Change your password to a non-standard secure one`}</span>
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
                        this.setState(prevState => ({
                          showPlanFields: !prevState.showPlanFields,
                          boughtplanid: 0
                        }))
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
                <input
                  className="inputBoxField inputBoxUnderline"
                  placeholder="Please insert your username/email"
                  onChange={e => {
                    const username = e.target.value;
                    this.setState({ username });
                  }}
                  autoFocus={this.props.needsubdomain ? false : true}
                />
              </div>
              <div className="field" style={{ width: "20em" }}>
                <div className="label">Password:</div>
                <input
                  className="inputBoxField inputBoxUnderline"
                  placeholder="Please insert your password"
                  type="password"
                  onChange={e => {
                    const password = e.target.value;
                    this.setState({ password });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="centerText">
          {this.state.success ? (
            ""
          ) : (
            <button
              disabled={showloading}
              className="naked-button genericButton"
              onClick={() => this.props.onClose()}
              style={{
                marginRight: "0.5em",
                backgroundColor: showloading ? "#ccc" : "#c73544",
                cursor: showloading ? "not-allowed" : "pointer"
              }}>
              <span className="textButton">
                {/*<i className="fal fa-long-arrow-alt-left" />*/}
                <i className="fal fa-times" />
              </span>
              <span className="textButtonBesideLeft">Cancel</span>
            </button>
          )}

          <button
            className="naked-button genericButton"
            onClick={this.addAccountTHIS}
            disabled={!fieldsCheck || showloading || this.state.success}
            style={{
              marginLeft: "0.5em",
              backgroundColor: fieldsCheck ? "" : "#c5c5c5",
              cursor: fieldsCheck && !showloading ? "pointer" : "not-allowed"
            }}>
            {this.state.success ? (
              <span className="textButton-success">
                <i className="fal fa-box-check" />
                Account successfully added
              </span>
            ) : (
              <span className="textButton">
                <i className={showloading ? "fas fa-spinner fa-spin" : "fal fa-check"} />
              </span>
            )}
            <span className="textButtonBeside">
              {fieldsCheck ? "Add Account" : "Please fill out all required fields"}
            </span>
          </button>
        </div>

        {this.state.error ? <ErrorComp error={this.state.error} /> : ""}
      </React.Fragment>
    );
  }
}
export default ShowEmployee;
