import * as React from "react";
import { Query } from "react-apollo";
import { WorkAround } from "../interfaces";
import gql from "graphql-tag";

export default function AccountName(props: {
  accountid: string;
  short?: boolean;
  className?: string;
}): JSX.Element {
  const { accountid } = props;
  const short = props.short === undefined ? false : props.short;

  const fetchLicence = gql`
    query fetchLicence($licenceid: ID!) {
      fetchLicence(licenceid: $licenceid) {
        id
        alias
      }
    }
  `;

  return (
    <Query<WorkAround, WorkAround> query={fetchLicence} variables={{ licenceid: accountid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }

        if (error && data && data.fetchLicence) {
          return <span>(can't fetch account data)</span>;
        }

        const accountData = data.fetchLicence;

        let returnstring = short ? accountData.alias.substring(1) : accountData.alias;

        return (
          <span className={props.className} data-recording-sensitive>
            {returnstring}
          </span>
        );
      }}
    </Query>
  );
}
