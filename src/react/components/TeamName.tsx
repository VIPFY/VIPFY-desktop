import * as React from "react";
import { Query } from "react-apollo";
import { WorkAround } from "../interfaces";
import { fetchTeam } from "../queries/departments";

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
