import * as React from "react";
import { graphql, compose, Query } from "react-apollo";
import gql from "graphql-tag";
import PopupAddLicence from "../../../popups/universalPopups/addLicence";

interface Props {
  service: any;
  licences: any[];
  close: Function;
  continue?: Function;
  addExternalBoughtPlan: Function;
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
        key="addEmpty"
        nooutsideclose={true}
        app={this.props.service}
        cancel={() => {
          this.setState({ addedLicence: null });
          this.props.close();
        }}
        success={() => this.props.close()}
        empty={true}
      />
    );
  }
}
export default compose(
  graphql(ADD_EXTERNAL_PLAN, {
    name: "addExternalBoughtPlan"
  })
)(AddEmpty);
