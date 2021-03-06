import * as React from "react";
import gql from "graphql-tag";
import { ErrorComp } from "../../common/functions";
import { Query } from "@apollo/client/react/components";
import LoadingDiv from "../LoadingDiv";
import Integration from "./Integration";

interface Props { }

interface State { }

const FETCH_INTEGRATIONS = gql`
  {
    adminFetchPendingIntegrations {
      id
      key
    }
  }
`;

class PendingIntegrations extends React.Component<Props, State> {
  state = {};
  render() {
    return (
      <section className="admin">
        <h1 style={{ marginLeft: 0 }}>Check the failed Integrations</h1>

        <Query<WorkAround, Workaround> query={FETCH_INTEGRATIONS} fetchPolicy="network-only">
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching data..." />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }

            return (
              <table className="failed-sso">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Service Name</th>
                    <th>Url</th>
                    <th>Recaptcha</th>
                    <th>Unloaded</th>
                    <th>Email entered</th>
                    <th>Password entered</th>
                    <th>Tries</th>
                    <th>Check</th>
                  </tr>
                </thead>

                <tbody>
                  {data.adminFetchPendingIntegrations.map(app => (
                    <Integration key={app.id} id={app.id} data={app.key} />
                  ))}
                </tbody>
              </table>
            );
          }}
        </Query>
      </section>
    );
  }
}

export default PendingIntegrations;
