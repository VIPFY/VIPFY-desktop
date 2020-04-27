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

  const fetchAppByIdName = gql`
    query fetchAppByIdName($id: ID!) {
      fetchAppByIdName(id: $id) {
        id
        name
      }
    }
  `;

  return (
    <Query<WorkAround, WorkAround> query={fetchAppByIdName} variables={{ id: serviceid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }

        if (error) {
          return <span>(can't fetch service data)</span>;
        }

        const serviceData = data.fetchAppByIdName;

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
