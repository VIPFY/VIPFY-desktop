import * as React from "react";
import { Query } from "@apollo/client/react/components";

import { fetchApps } from "../../../queries/products";
import LoadingDiv from "../../LoadingDiv";
import { ErrorComp } from "../../../common/functions";
import UniversalLoginTest from "./UniversalLoginTest";

class UniversalLoginTestFetcher extends React.Component<{}> {
  render() {
    return (
      <Query query={fetchApps}>
        {({ data, loading, error = null }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error) {
            return <ErrorComp error={error} />;
          }

          if (data.allApps && data.allApps.length) {
            return <UniversalLoginTest dbApps={data.allApps} />;
          } else {
            return <UniversalLoginTest />;
          }
        }}
      </Query>
    );
  }
}

export default UniversalLoginTestFetcher;
