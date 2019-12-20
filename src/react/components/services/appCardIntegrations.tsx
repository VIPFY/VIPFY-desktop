import * as React from "react";
import { clipboard } from "electron";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import { randomPassword } from "../../common/passwordgen";

import gql from "graphql-tag";
import { graphql, compose, withApollo, Query } from "react-apollo";
import { me, fetchLicences } from "../../queries/auth";
import { getBgImageApp } from "../../common/images";
import { createEncryptedLicenceKeyObject } from "../../common/licences";
import AssignNewAccount from "../manager/universal/adding/assignNewAccount";
import LoadingDiv from "../LoadingDiv";

interface Props {
  id: number;
  logo: string;
  name: string;
  teaserdescription: string;
  needssubdomain: Boolean;
  options: JSON;
  addExternalPlan: Function;
  addExternalApp: Function;
  icon: string;
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
    $key: JSON!
    $price: Float
    $appid: ID!
    $boughtplanid: ID!
    $touser: ID
  ) {
    addEncryptedExternalLicence(
      key: $key
      price: $price
      appid: $appid
      boughtplanid: $boughtplanid
      touser: $touser
    ) {
      id
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

      const key = await createEncryptedLicenceKeyObject(
        {
          username: this.state.email,
          password: this.state.password,
          loginurl:
            this.state.subdomain != ""
              ? `${this.props.options.predomain}${this.state.subdomain}${this.props.options.afterdomain}`
              : null,
          external: true
        },
        null,
        this.props.client
      );

      await this.props.addExternalApp({
        variables: {
          key,
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
    const { id, logo, name } = this.props;
    return (
      <>
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
        </div>
        {this.state.popup && (
          <Query query={me}>
            {({ data, loading, error }) => {
              if (loading) {
                return <LoadingDiv />;
              }
              if (error) {
                return <div>Error loading data</div>;
              }
              return (
                <AssignNewAccount
                  employee={data.me}
                  close={() => this.setState({ popup: false })}
                  service={this.props}
                />
              );
            }}
          </Query>
        )}
      </>
    );
  }
}
export default compose(
  graphql(ADD_EXTERNAL_ACCOUNT, { name: "addExternalApp" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalPlan" }),
  withApollo
)(AppCardIntegrations);
