import * as React from "react";
import { Query } from "react-apollo";
import { WorkAround } from "../interfaces";
import gql from "graphql-tag";

/**
 * Prints a user name. If the person is the current user, it diplays "You"
 *
 * @param userid is the currently logged in user, can be passed through from the app
 * @param unitid is the id of the username to be displayed
 * @param short whether to choose a shorter represenation (e.g. first name only). defaults to false
 *
 * @example <UserName {...props} unitid={22} short={true} />
 *
 * @returns {JSX.Element}
 */
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

        if (error) {
          return <span>(can't fetch orbit data)</span>;
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
