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
import { concatName } from "../../common/functions";

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
  boughtplanid?: number;
}

interface State {
  subdomain: string;
  email: string;
  password: string;
  integrateApp: any;
  randomkey: string;
  empty: string;
  newid: number;
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
    empty: "",
    newid: -1
  };

  UNSAFE_componentWillReceiveProps = async props => {
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

  render() {
    const { name, needssubdomain, options, icon, id } = this.props.app;
    const { employee, cancel, success, team, addStyles, empty } = this.props;
    return (
      <FormPopup
        key={`addLicence-${id}-${(employee && employee.id) || ""}`}
        heading="Add Account"
        subHeading={
          employee ? (
            <span>
              Add an account of {name} to
              <br />
              {concatName(employee)}
            </span>
          ) : (
            <span>Add an empty account of {name}</span>
          )
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
                          Subdomain for ${name}
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
                label: `Username for ${name}`
              }
            },
            {
              id: `${employee && employee.id}-${id}-password`,
              options: {
                label: `Password for ${name}`,
                type: "password"
              }
            }
          ])}
        close={action => {
          if (action == "error") {
            if (success) {
              success({ error: "Some Error" });
            }
          } else if (action == "sucess") {
            if (success) {
              success({ licenceid: this.state.newid });
            }
          } else {
            cancel();
          }
        }}
        submitDisabled={values =>
          !(
            values[`${employee && employee.id}-${id}-email`] &&
            values[`${employee && employee.id}-${id}-password`] &&
            (!needssubdomain || values[`${employee && employee.id}-${id}-subdomain`])
          )
        }
        submit={async values => {
          // try {
          let res;
          if (!this.props.boughtplanid) {
            res = await this.props.addExternalBoughtPlan({
              variables: {
                appid: id,
                alias: "",
                price: 0,
                loginurl: ""
              }
            });
          }
          //console.log("ADDLICENCE");
          res = await this.props.addLicence({
            variables: {
              appid: id,
              boughtplanid: this.props.boughtplanid
                ? this.props.boughtplanid.id
                : res.data.addExternalBoughtPlan.id,
              username: values[`${employee && employee.id}-${id}-email`],
              password: values[`${employee && employee.id}-${id}-password`],
              loginurl: `${options.predomain}${
                values[`${employee && employee.id}-${id}-subdomain`]
              }${options.afterdomain}`,
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
          this.setState({ newid: res.data.addExternalAccountLicence });
          //console.log("res", res);
          //if (success) {
          //  success();
          //}
          // } catch (err) {
          //    console.log("ERROR TEST", err);
          //    if (success) {
          //      success({ error: err });
          //    }
          // }
        }}
        /*handleError={err => {
          console.log("ERROR TEST", err);
          if (success) {
            success({ error: err });
          }
        }}*/
        explainImage={
          <div style={{ position: "relative", width: "88px", height: "112px" }}>
            <div
              style={{
                position: "absolute",
                top: "-5px",
                left: "-5px",
                width: "48px",
                height: "48px",
                borderRadius: "4px",
                //border: "1px dashed #707070"
                backgroundColor: "#f3f3f3"
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
                //border: "1px solid #253647",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundImage: getBgImageApp(icon, 70),
                boxShadow: "rgba(0,0,0,0.16) 0px 0px 4px"
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
                //border: "1px solid #253647",
                //boxShadow: "#00000010 0px 6px 10px",
                backgroundImage: employee && getBgImageUser(employee.profilepicture, 48),
                boxShadow: "rgba(0, 0, 0, 0.25) 3px 3px 6px"
              }}>
              {employee ? (employee.profilepicture ? "" : employee.firstname.slice(0, 1)) : "E"}
            </div>
          </div>
        }
      />
    );
  }
}
export default compose(
  graphql(ADD_LICENCE_TO_USER, { name: "addLicence" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalBoughtPlan" })
)(PopupAddLicence);
