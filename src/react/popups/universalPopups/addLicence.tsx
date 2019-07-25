import * as React from "react";
import PopupBase from "./popupBase";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import UniversalButton from "../../components/universalButtons/universalButton";
import { randomPassword } from "../../common/passwordgen";
import { getBgImageApp, getBgImageUser } from "../../common/images";
import FormPopup from "./formPopup";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { fetchUserLicences } from "../../queries/departments";
import { fetchCompanyService } from "../../queries/products";

interface Props {
  app: {
    name: string;
    needssubdomain: Boolean;
    options: { predomain: string; afterdomain: string };
    icon: string;
    id: number;
  };
  cancel: Function;
  add?: Function;
  //employeename?: string;
  employee: Object;
  nooutsideclose?: Boolean;
  empty?: Boolean;
  currentstep?: number;
  maxstep?: number;
  addExternalBoughtPlan: Function;
  addLicence: Function;
  success?: Function;
  team?: Object;
  addStyles?: Object;
}

interface State {
  subdomain: string;
  email: string;
  password: string;
  integrateApp: any;
  randomkey: string;
  empty: string;
}

const ADD_LICENCE_TO_USER = gql`
  mutation addExternalAccountLicence(
    $username: String!
    $password: String!
    $appid: ID
    $boughtplanid: ID!
    $price: Float
    $loginurl: String
    $touser: ID
    $identifier: String
    $options: JSON
  ) {
    addExternalAccountLicence(
      touser: $touser
      boughtplanid: $boughtplanid
      price: $price
      appid: $appid
      loginurl: $loginurl
      password: $password
      username: $username
      identifier: $identifier
      options: $options
    )
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

class PopupAddLicence extends React.Component<Props, State> {
  state = {
    subdomain: "",
    email: "",
    password: "",
    integrateApp: {},
    randomkey: "",
    empty: ""
  };

  componentWillReceiveProps = async props => {
    await this.setState({
      subdomain: "",
      email: "",
      password: "",
      integrateApp: {},
      randomkey: await randomPassword()
    });
  };

  printSteps() {
    const steps: JSX.Element[] = [];
    for (let i = 0; i < this.props.maxstep!; i++) {
      if (i < this.props.currentstep!) {
        steps.push(<div key={`step-${i}`} className="step done" />);
      } else if (i == this.props.currentstep) {
        steps.push(<div key={`step-${i}`} className="step current" />);
      } else {
        steps.push(<div key={`step-${i}`} className="step" />);
      }
    }
    return (
      <div className="steps" style={{ width: `${this.props.maxstep! * 10}px` }}>
        {steps}
      </div>
    );
  }

  generateName(first, middle, last) {
    let name = first;
    if (!name) {
      name = middle;
    } else if (middle) {
      name += " ";
      name += middle;
    }
    if (!name) {
      name = last;
    } else if (last) {
      name += " ";
      name += last;
    }
    return name;
  }

  render() {
    const { name, needssubdomain, options, icon, id } = this.props.app;
    const { employee, cancel, success, team, addStyles, empty } = this.props;
    console.log("ADDLICENCE", this.props);
    return (
      <FormPopup
        key={`addLicence-${id}-${(employee && employee.id) || ""}`}
        heading="Add Account"
        subHeading={
          employee
            ? `Add an account of ${name} to ${this.generateName(
                employee.firstname,
                employee.middlename,
                employee.lastname
              )}`
            : `Add an empty account of ${name}`
        }
        addStyles={addStyles}
        nooutsideclose={true}
        fields={(empty
          ? [
              {
                id: `${id}-identifier`,
                options: {
                  label: "Identifier"
                }
              }
            ]
          : []
        )
          .concat(
            needssubdomain
              ? [
                  {
                    id: `${employee && employee.id}-${id}-subdomain`,
                    options: {
                      label: "Subdomain",
                      children: (
                        <span className="small">
                          Please insert your subdomain.
                          <br />
                          {options.predomain}YOUR SUBDOMAIN
                          {options.afterdomain}
                        </span>
                      )
                    }
                  }
                ]
              : []
          )
          .concat([
            {
              id: `${employee && employee.id}-${id}-email`,
              options: {
                label: `Username for your ${name}-Account`
              }
            },
            {
              id: `${employee && employee.id}-${id}-password`,
              options: {
                label: `Password for your ${name}-Account`,
                type: "password"
              }
            }
          ])}
        close={() => cancel()}
        submit={async values => {
          try {
            let res = await this.props.addExternalBoughtPlan({
              variables: {
                appid: id,
                alias: "",
                price: 0,
                loginurl: ""
              }
            });
            await this.props.addLicence({
              variables: {
                appid: id,
                boughtplanid: res.data.addExternalBoughtPlan.id,
                username: values[`${employee && employee.id}-${id}-email`],
                password: values[`${employee && employee.id}-${id}-password`],
                loginurl: values[`${employee && employee.id}-${id}-subdomain`],
                touser: (employee && employee.id) || null,
                options: team
                  ? {
                      teamlicence: team.unitid.id
                    }
                  : null,
                identifier: empty ? values[`${id}-identifier`] : null
              },
              refetchQueries: [
                empty
                  ? {
                      query: fetchCompanyService,
                      variables: { serviceid: id }
                    }
                  : {
                      query: fetchUserLicences,
                      variables: { unitid: employee.id }
                    }
              ]
            });
            if (success) {
              console.log("SUCCESS");
              success();
            }
          } catch (err) {
            console.log("ERROR", err);
            if (success) {
              success({ error: err });
            }
          }
        }}
        explainImage={
          <div style={{ position: "relative", width: "88px", height: "112px" }}>
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "48px",
                height: "48px",
                borderRadius: "4px",
                border: "1px dashed #707070"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "16px",
                width: "70px",
                height: "70px",
                fontSize: "32px",
                lineHeight: "70px",
                textAlign: "center",
                borderRadius: "4px",
                backgroundColor: "white",
                border: "1px solid #253647",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundImage: getBgImageApp(icon, 70)
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                width: employee && employee.profilepicture ? "48px" : "46px",
                height: employee && employee.profilepicture ? "48px" : "46px",
                borderRadius: "4px",
                backgroundPosition: "center",
                backgroundSize: "cover",
                lineHeight: "46px",
                textAlign: "center",
                fontSize: "23px",
                color: "white",
                fontWeight: 500,
                backgroundColor: "#5D76FF",
                border: "1px solid #253647",
                boxShadow: "#00000010 0px 6px 10px",
                backgroundImage: employee && getBgImageUser(employee.profilepicture, 48)
              }}>
              {employee ? (employee.profilepicture ? "" : employee.firstname.slice(0, 1)) : "E"}
            </div>
          </div>
        }
      />
    );
    return (
      <PopupBase
        key={this.state.randomkey}
        nooutsideclose={this.props.nooutsideclose}
        closeable={false}
        buttonStyles={{ justifyContent: "space-between", display: "none" }}
        fullmiddle={true}
        small={true}
        close={() => this.props.cancel()}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "88px", height: "112px" }}>
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "48px",
                height: "48px",
                borderRadius: "4px",
                border: "1px dashed #707070"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "16px",
                width: "70px",
                height: "70px",
                fontSize: "32px",
                lineHeight: "70px",
                textAlign: "center",
                borderRadius: "4px",
                backgroundColor: "white",
                border: "1px solid #253647",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundImage: getBgImageApp(icon, 70)
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                width: employee && employee.profilepicture ? "48px" : "46px",
                height: employee && employee.profilepicture ? "48px" : "46px",
                borderRadius: "4px",
                backgroundPosition: "center",
                backgroundSize: "cover",
                lineHeight: "46px",
                textAlign: "center",
                fontSize: "23px",
                color: "white",
                fontWeight: 500,
                backgroundColor: "#5D76FF",
                border: "1px solid #253647",
                boxShadow: "#00000010 0px 6px 10px",
                backgroundImage: employee && getBgImageUser(employee.profilepicture, 48)
              }}>
              {employee
                ? employee.profilepicture
                  ? ""
                  : employee.firstname.slice(0, 1)
                : this.props.employeename
                ? this.props.employeename.slice(0, 1)
                : "E"}
            </div>
          </div>
          <div style={{ width: "284px" }}>
            <h2
              className="cleanup"
              style={{
                fontSize: "16px",
                lineHeight: "21px",
                fontWeight: 700,
                marginBottom: "24px",
                display: "block"
              }}>
              {this.props.empty
                ? `Add empty licence of service ${name}`
                : `Add an account of "${name}" to ${this.props.employeename}`}
            </h2>

            <div>
              <div style={{ width: "100%", height: "16px" }} />
              {this.props.empty && (
                <>
                  <UniversalTextInput
                    width="100%"
                    id="emptyid"
                    label="Identifier"
                    startvalue=""
                    livevalue={value => this.setState({ empty: value })}>
                    <span className="small">Please give an identifier for the empty licence.</span>
                  </UniversalTextInput>
                  <div style={{ width: "100%", height: "24px" }} />
                </>
              )}
              {needssubdomain ? (
                <React.Fragment>
                  <UniversalTextInput
                    width="100%"
                    id="subdomain"
                    label="Subdomain"
                    startvalue=""
                    livevalue={value => this.setState({ subdomain: value })}>
                    <span className="small">
                      Please insert your subdomain.
                      <br />
                      {options.predomain}YOUR SUBDOMAIN
                      {options.afterdomain}
                    </span>
                  </UniversalTextInput>
                  <div style={{ width: "100%", height: "24px" }} />
                </React.Fragment>
              ) : (
                ""
              )}

              <UniversalTextInput
                width="100%"
                id={`${name}-email`}
                label="Username/Email"
                startvalue=""
                livevalue={value => this.setState({ email: value })}
              />
              <div style={{ width: "100%", height: "24px" }} />
              <UniversalTextInput
                width="100%"
                id={`${name}-password`}
                label="Password"
                type="password"
                startvalue=""
                livevalue={value => this.setState({ password: value })}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <UniversalButton
            type="low"
            onClick={() => this.props.cancel()}
            label={this.props.maxstep && this.props.maxstep > 1 ? "Skip" : "Cancel"}
          />
          {this.props.maxstep && this.props.maxstep > 1 && this.printSteps()}
          <UniversalButton
            type="high"
            label="Add"
            disabled={
              this.state.email == "" ||
              this.state.password == "" ||
              (needssubdomain && this.state.subdomain == "")
            }
            onClick={() =>
              this.props.add({
                email: this.state.email,
                password: this.state.password,
                subdomain: this.state.subdomain,
                empty: this.state.empty
              })
            }
          />
        </div>
      </PopupBase>
    );
  }
}
export default compose(
  graphql(ADD_LICENCE_TO_USER, { name: "addLicence" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalBoughtPlan" })
)(PopupAddLicence);
