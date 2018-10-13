import * as React from "react";
import { Query } from "react-apollo";
import { QUERY_USER } from "../queries/user";

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
export default function UserName(props: {
  unitid: number | null;
  userid?: number;
  short?: boolean;
  className?: string;
}): JSX.Element {
  const { unitid, userid } = props;
  const short = props.short === undefined ? false : props.short;

  if (unitid === null || unitid === undefined) {
    return <span>System</span>;
  }

  if (unitid == userid) {
    return <span className="user-name"> You </span>;
  }

  return (
    <Query query={QUERY_USER} variables={{ userid: unitid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }

        if (error) {
          return <span>(can't fetch user data)</span>;
        }

        const userData = data.fetchPublicUser;
        return (
          <span className={props.className}>
            {short ? userData.firstname : `${userData.firstname} ${userData.lastname}`}
          </span>
        );
      }}
    </Query>
  );
}
