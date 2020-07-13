import * as React from "react";
import { Query } from "react-apollo";
import { WorkAround } from "../interfaces";
import gql from "graphql-tag";

export default function TeamName(props: {
  teamid: string;
  short?: boolean;
  className?: string;
}): JSX.Element {
  const { teamid } = props;
  const short = props.short === undefined ? false : props.short;

  const fetchTeamName = gql`
    query fetchTeamName($teamid: ID!) {
      fetchTeamName(teamid: $teamid)
    }
  `;

  return (
    <Query<WorkAround, WorkAround> query={fetchTeamName} variables={{ teamid }}>
      {({ loading, error, data }) => {
        console.log("FETCHING TEAM", loading, error, data);
        if (loading) {
          return <span />;
        }

        if (error) {
          console.log("RETURN");
          return <span>(can't fetch team data)</span>;
        }

        const teamData = data.fetchTeamName;
        return (
          <span className={props.className} data-recording-sensitive>
            {short ? teamData.substring(1) : teamData}
          </span>
        );
      }}
    </Query>
  );
}
