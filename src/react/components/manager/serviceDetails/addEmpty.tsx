import * as React from "react";
import UniversalButton from "../../../components/universalButtons/universalButton";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "../../../popups/universalPopups/popupBase";
import UniversalSearchBox from "../../universalSearchBox";
import PopupAddLicence from "../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../popups/universalPopups/selfSaving";
import PrintCurrent from "../universal/printCurrent";
import { fetchCompanyService } from "../../../queries/products";

interface Props {
  service: any;
  licences: any[];
  close: Function;
  continue?: Function;
  addExternalBoughtPlan: Function;
  addExternalAccountLicence: Function;
}

interface State {
  search: string;
  popup: Boolean;
  drag: {
    profilepicture: string;
    internaldata: { color: string; letters: string };
    name: string;
    integrating: Boolean;
  } | null;
  integrateEmployee: {
    profilepicture: string;
    firstname: string;
    lastname: string;
    integrating: Boolean;
    id: number;
    services: any[];
  } | null;
  dragdelete: {
    profilepicture: string;
    firstname: string;
    lastname: string;
    integrating: Boolean;
    id: number;
    services: any[];
  } | null;
  addedLicence: Object | null;
  counter: number;
  configureServiceLicences: Boolean;
  saved: Boolean;
  error: string | null;
  saving: Boolean;
}

const ADD_EXTERNAL_ACCOUNT = gql`
  mutation onAddExternalAccountLicence(
    $username: String!
    $password: String!
    $loginurl: String
    $price: Float
    $appid: ID!
    $boughtplanid: ID!
    $touser: ID
    $identifier: String
  ) {
    addExternalAccountLicence(
      username: $username
      password: $password
      loginurl: $loginurl
      price: $price
      appid: $appid
      boughtplanid: $boughtplanid
      touser: $touser
      identifier: $identifier
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

class AddEmpty extends React.Component<Props, State> {
  state = {
    search: "",
    popup: false,
    drag: null,
    integrateEmployee: null,
    dragdelete: null,
    addedLicence: null,
    counter: 0,
    configureServiceLicences: true,
    saved: false,
    error: null,
    saving: false
  };

  render() {
    return (
      <PopupAddLicence
        nooutsideclose={true}
        app={this.props.service}
        cancel={() => {
          this.setState({ addedLicence: null });
          this.props.close();
        }}
        add={setup => {
          this.props.close({
            savedmessage: "Empty licence has been successfully added",
            savingmessage: "Empty licence is currently added",
            saveFunction: async () => {
              let res = await this.props.addExternalBoughtPlan({
                variables: {
                  appid: this.props.service.id,
                  alias: "",
                  price: 0,
                  loginurl: ""
                }
              });
              await this.props.addExternalAccountLicence({
                variables: {
                  username: setup!.email,
                  password: setup!.password,
                  loginurl: setup!.subdomain,
                  identifier: setup!.empty,
                  price: 0,
                  appid: this.props.service.id,
                  boughtplanid: res.data.addExternalBoughtPlan.id,
                  touser: null
                },
                refetchQueries: [
                  {
                    query: fetchCompanyService,
                    variables: { serviceid: this.props.service.id }
                  }
                ]
              });
            }
          });
        }}
        empty={true}
      />
    );
  }
}
export default compose(
  graphql(ADD_EXTERNAL_ACCOUNT, {
    name: "addExternalAccountLicence"
  }),
  graphql(ADD_EXTERNAL_PLAN, {
    name: "addExternalBoughtPlan"
  })
)(AddEmpty);
