import * as React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { filterError, ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import NSConfig from "./NSConfig";

const FETCH_DOMAIN = gql`
  query onFetchDomain($id: ID!) {
    fetchDomain(id: $id) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
      dns
    }
  }
`;

interface Props {
  onClose: Function;
  id: string;
}

interface State {
  showNs: boolean;
}

class Configuration extends React.Component<Props, State> {
  state = {
    showNs: true
  };

  render() {
    return (
      <div className="domain-configuration">
        <ul className="domain-navigation">
          <li>Nameservers</li>
          <li>Zone</li>
        </ul>

        <Query query={FETCH_DOMAIN} variables={{ id: this.props.id }}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv text="Fetching Domain..." />;
            }

            if (error || !data) {
              return <ErrorComp error={filterError(error)} />;
            }

            if (!data.fetchDomain.dns) {
              data.fetchDomain.dns = [];
            }

            return <NSConfig domain={data.fetchDomain} />;
          }}
        </Query>
      </div>
    );
  }
}

export default Configuration;
