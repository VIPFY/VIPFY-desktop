import * as React from "react";
import { Query } from "react-apollo";
import { WorkAround } from "../interfaces";
import { fetchTeam } from "../queries/departments";

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
export default function TeamName(props: {
  teamid: string;
  short?: boolean;
  className?: string;
}): JSX.Element {
  const { teamid } = props;
  const short = props.short === undefined ? false : props.short;

  return (
    <Query<WorkAround, WorkAround> query={fetchTeam} variables={{ teamid }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <span />;
        }

        if (error) {
          return <span>(can't fetch team data)</span>;
        }

        const teamData = data.fetchTeam;
        return (
          <span className={props.className} data-recording-sensitive>
            {short ? teamData.name.substring(1) : teamData.name}
          </span>
        );
      }}
    </Query>
  );
}
