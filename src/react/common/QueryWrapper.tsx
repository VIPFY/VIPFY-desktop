import * as React from "react";
import { Query } from "@apollo/client/react/components";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp } from "./functions";

interface Props {
  query: any;
  children: (data: any) => any;
}

class QueryWrapper extends React.Component<Props> {
  render() {
    return (
      <Query query={this.props.query}>
        {({ data, loading, error = null }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error) {
            return <ErrorComp error={error} />;
          }

          return this.props.children(data);
        }}
      </Query>
    );
  }
}

export default QueryWrapper;
