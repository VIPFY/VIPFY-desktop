import * as React from "react";

import { withApollo, Query } from "react-apollo";
import compose from "lodash.flowright";
import { me } from "../../queries/auth";
import { getBgImageApp } from "../../common/images";
import AssignNewAccount from "../manager/universal/adding/assignNewAccount";
import LoadingDiv from "../LoadingDiv";

interface Props {
  id: number;
  logo: string;
  name: string;
}

interface State {
  popup: Boolean;
}

class AppCardIntegrations extends React.Component<Props, State> {
  state = {
    popup: false
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
                  noServiceEdit={true}
                />
              );
            }}
          </Query>
        )}
      </>
    );
  }
}
export default compose(withApollo)(AppCardIntegrations);
