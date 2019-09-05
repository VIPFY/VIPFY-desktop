import * as React from "react";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import { randomPassword } from "../../common/passwordgen";

import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { me, fetchLicences } from "../../queries/auth";
import { getBgImageApp } from "../../common/images";

interface Props {
  id: number;
  logo: string;
  name: string;
  teaserdescription: string;
  needssubdomain: Boolean;
  options: JSON;
  addExternalPlan: Function;
  addExternalApp: Function;
}

interface State {
  popup: Boolean;
  email: string;
  password: string;
  subdomain: string;
  pw1: string;
  pw2: string;
  pw3: string;
  confirm: Boolean;
  integrating: Boolean;
  integrated: Boolean;
}

const ADD_EXTERNAL_ACCOUNT = gql`
  mutation onAddExternalLicence(
    $username: String!
    $password: String!
    $loginurl: String
    $price: Float
    $appid: ID!
    $boughtplanid: ID!
    $touser: ID
  ) {
    addExternalLicence(
      username: $username
      password: $password
      loginurl: $loginurl
      price: $price
      appid: $appid
      boughtplanid: $boughtplanid
      touser: $touser
    ) {
      ok
    }
  }
`;

const ADD_EXTERNAL_PLAN = gql`
  mutation onAddExternalBoughtPlan($appid: ID!, $alias: String, $price: Float, $loginurl: String) {
    addExternalBoughtPlan(appid: $appid, alias: $alias, price: $price, loginurl: $loginurl) {
      id
      alias
    }
  }
`;

class AppCardIntegrations extends React.Component<Props, State> {
  state = {
    popup: false,
    email: "",
    password: "",
    subdomain: "",
    pw1: "",
    pw2: "",
    pw3: "",
    confirm: false,
    integrating: true,
    integrated: false
  };

  componentDidMount = async () => {
    const pw1 = await randomPassword();
    const pw2 = await randomPassword();
    const pw3 = await randomPassword();
    this.setState({ pw1, pw2, pw3 });
  };

  addAccount = async () => {
    this.setState({ confirm: true, integrating: true, integrated: false });
    try {
      const newPlan = await this.props.addExternalPlan({
        variables: {
          alias: this.props.name,
          loginurl:
            this.state.subdomain != ""
              ? `${this.props.options.predomain}${this.state.subdomain}${this.props.options.afterdomain}`
              : null,
          appid: this.props.id
        }
      });

      const id = newPlan.data.addExternalBoughtPlan.id;

      await this.props.addExternalApp({
        variables: {
          username: this.state.email,
          password: this.state.password,
          loginurl:
            this.state.subdomain != ""
              ? `${this.props.options.predomain}${this.state.subdomain}${this.props.options.afterdomain}`
              : null,
          price: null,
          appid: this.props.id,
          boughtplanid: id,
          touser: null
        },
        refetchQueries: [{ query: me }, { query: fetchLicences }]
      });
      this.setState({ integrated: true, integrating: false });
      return true;
    } catch (error) {
      console.log("ERROR", error);
      throw error;
    }
  };

  render() {
    const { clipboard } = require("electron");
    const { id, logo, name, teaserdescription, needssubdomain, options } = this.props;
    return (
      <div className="appIntegration" key={id}>
        <div
          className="appIntegrationLogo"
          style={{
            backgroundImage: getBgImageApp(logo, 128)
          }}
        />
        <div className="captionIntegration">
          <h3>{name}</h3>
        </div>
        <button className="button-external" onClick={() => this.setState({ popup: true })}>
          <i className="fas fa-boxes" /> Add as External
        </button>
        {this.state.popup ? (
          <PopupBase
            small={true}
            close={() => this.setState({ popup: false, email: "", password: "", subdomain: "" })}>
            <div>
              <h1 className="cleanup lightHeading">
                Only two simple steps to integrate your existing account for {name} into VIPFY
              </h1>
            </div>
            <div>
              <h2 className="cleanup boldHeading">1. Change your password</h2>
            </div>
            <p className="light">
              Please log into your existing account and change the password into a secure one.
            </p>
            <p className="error small">
              Do not use any password you use anywhere else nor a weak one (e.g. 1234)
            </p>
            <p className="bold small">Good examples are:</p>
            <ul>
              {[this.state.pw1, this.state.pw2, this.state.pw3].map((pw, key) => (
                <li
                  key={key}
                  className="cleanup small"
                  title="Click to copy to clipboard"
                  onClick={() => clipboard.writeText(pw)}>
                  {pw}
                </li>
              ))}
            </ul>
            <div style={{ width: "100px", height: "40px" }} />
            <div>
              <h2 className="cleanup boldHeading">2. Enter account details</h2>
            </div>

            {needssubdomain ? (
              <UniversalTextInput
                id={`${name}-subdomain`}
                label="Subdomain"
                livevalue={value => this.setState({ subdomain: value })}>
                <span className="small">
                  Please insert your subdomain.
                  <br />
                  {options.predomain}YOUR SUBDOMAIN{options.afterdomain}
                </span>
              </UniversalTextInput>
            ) : (
              ""
            )}

            <UniversalTextInput
              id={`${name}-email`}
              label="Username/Email"
              livevalue={value => this.setState({ email: value })}
            />
            <UniversalTextInput
              id={`${name}-password`}
              label="Password"
              type="password"
              livevalue={value => this.setState({ password: value })}
            />
            <UniversalButton type="low" closingPopup={true} label="Cancel" />
            <UniversalButton
              type="high"
              label="Confirm"
              disabled={
                this.state.email == "" ||
                this.state.password == "" ||
                (this.props.needssubdomain && this.state.subdomain == "")
              }
              onClick={() => this.addAccount()}
            />
            {this.state.confirm ? (
              <PopupBase
                close={() => this.setState({ confirm: false, integrating: true })}
                small={true}
                closeable={false}
                autoclosing={5}
                autoclosingFunction={() => this.setState({ integrating: false })}>
                {this.state.integrating ? (
                  <div>
                    <div style={{ fontSize: "32px", textAlign: "center" }}>
                      <i className="fal fa-spinner fa-spin" />
                      <div style={{ marginTop: "32px", fontSize: "16px" }}>
                        Your account is currently being integrated
                      </div>
                    </div>
                  </div>
                ) : this.state.integrated ? (
                  <React.Fragment>
                    <div>Your account has been successfully integrated</div>
                    <UniversalButton
                      type="high"
                      closingPopup={true}
                      label="Ok"
                      closingAllPopups={true}
                    />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div>
                      It takes a little bit longer to integrate your account. We will inform you
                      when it is done.
                    </div>
                    <UniversalButton
                      type="high"
                      closingPopup={true}
                      label="Ok"
                      closingAllPopups={true}
                    />
                  </React.Fragment>
                )}
              </PopupBase>
            ) : (
              ""
            )}
          </PopupBase>
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default compose(
  graphql(ADD_EXTERNAL_ACCOUNT, { name: "addExternalApp" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalPlan" })
)(AppCardIntegrations);
