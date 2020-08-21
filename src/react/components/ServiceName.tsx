import * as React from "react";
import { Query } from "react-apollo";
import { WorkAround } from "../interfaces";
import gql from "graphql-tag";

export default function ServiceName(props: {
  serviceid: string;
  short?: boolean;
  className?: string;
}): JSX.Element {
  const { serviceid } = props;
  const short = props.short === undefined ? false : props.short;

  const FETCH_APP_NAME_BY_ID = gql`
    query onFetchAppNameByID($id: ID!) {
      fetchAppNameByID(id: $id) {
        id
        name
      }
    }
  `;

  return (
    <Query<WorkAround, WorkAround> query={FETCH_APP_NAME_BY_ID} variables={{ id: serviceid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }

        if (error || !data) {
          return <span>(can't fetch service data)</span>;
        }

        const serviceData = data.fetchAppNameByID;

        let returnstring = short ? serviceData.name.substring(1) : serviceData.name;

        return (
          <span className={props.className} data-recording-sensitive>
            {returnstring}
          </span>
        );
      }}
    </Query>
  );
}
