import * as React from "react";
import PopupAddLicence from "../../../../popups/universalPopups/addLicence";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

interface Props {
  close: Function;
  employee: any;
  service: any;
  savingFunction: Function;
  addLicence: Function;
  addExternalBoughtPlan: Function;
}

interface State {
  counter: number;
  setup: any;
}

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
    counter: 0,
    setup: null
  };

  componentWillUnmount() {
    this.setState({ counter: 0, setup: null });
  }

  render() {
    const { service, close, employee } = this.props;
    return (
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
    );
  }
}
export default compose(graphql(ADD_EXTERNAL_PLAN, { name: "addExternalBoughtPlan" }))(
  AddEmployeeToService
);
