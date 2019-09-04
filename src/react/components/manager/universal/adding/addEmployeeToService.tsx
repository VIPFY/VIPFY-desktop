import * as React from "react";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { fetchUserLicences } from "../../../../queries/departments";

interface Props {
  close: Function;
  employee: any;
  service: any;
  savingFunction: Function;
  addLicence: Function;
  addExternalBoughtPlan: Function;
}

interface State {
  saving: Boolean;
  counter: number;
  setup: any;
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

class AddEmployeeToService extends React.Component<Props, State> {
  state = {
    saving: false,
    counter: 0,
    setup: null
  };

  componentWillUnmount() {
    this.setState({ saving: false, counter: 0, setup: null });
  }

  render() {
    const { service, close, employee } = this.props;
    console.log("AETS", this.props, this.state);
    return (
      <>
        <PopupAddLicence
          nooutsideclose={true}
          app={service}
          cancel={async () => close()}
          success={info =>
            info && info.error
              ? this.props.savingFunction({ action: "error", message: info.error })
              : this.props.savingFunction({ action: "success" })
          }
          employee={employee}
          employeename={employee.firstname} //TODO make it nice
        />
        {this.state.saving && (
          <PopupSelfSaving
            savedmessage={`Created licence of service ${service.name} for employee ${
              employee.firstname
            }`}
            savingmessage={`Creating licence of service ${service.name} for employee ${
              employee.firstname
            }`}
            closeFunction={() => close()}
            saveFunction={async () => {
              try {
                let res = await this.props.addExternalBoughtPlan({
                  variables: {
                    appid: service.id,
                    alias: "",
                    price: 0,
                    loginurl: ""
                  }
                });
                await this.props.addLicence({
                  variables: {
                    appid: service.id,
                    boughtplanid: res.data.addExternalBoughtPlan.id,
                    username: this.state.setup!.email,
                    password: this.state.setup!.password,
                    loginurl: this.state.setup!.subdomain,
                    touser: employee.id
                  },
                  refetchQueries: [
                    {
                      query: fetchUserLicences,
                      variables: { unitid: this.props.employee.id }
                    }
                  ]
                });

                this.props.savingFunction({ action: "success" });
              } catch (error) {
                console.error(error);
                this.props.savingFunction({ action: "error", message: error });
              }
            }}
            maxtime={5000}
          />
        )}
      </>
    );
  }
}
export default compose(
  graphql(ADD_LICENCE_TO_USER, { name: "addLicence" }),
  graphql(ADD_EXTERNAL_PLAN, { name: "addExternalBoughtPlan" })
)(AddEmployeeToService);
