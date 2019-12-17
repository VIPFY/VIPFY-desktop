import * as React from "react";
import { getBgImageTeam } from "../../../../common/images";
import { Query } from "react-apollo";
import { fetchTeam } from "../../../../queries/departments";

interface Props {
  team: any;
  className?: string | null;
  size?: number;
  title?: string;
  fake?: boolean;
  styles?: Object;
  onlyids?: Boolean;
}

export default (props: Props) => {
  const { team, title } = props;
  const size = props.size || 32;

  if (props.fake) {
    return (
      <div
        key={team.name}
        title={title || team.name}
        className={props.className || "managerSquare"}
        style={Object.assign({ ...(props.styles || {}) }, { backgroundColor: "#F2F2F2" })}></div>
    );
  }
  if (props.onlyids) {
    return (
      <Query pollInterval={60 * 10 * 1000 + 200} query={fetchTeam} variables={{ teamid: team }}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }

          const fetchedteam = data.fetchTeam;

          if (fetchedteam) {
            return (
              <div
                key={fetchedteam.name}
                title={title || fetchedteam.name}
                className={props.className || "managerSquare"}
                style={Object.assign(
                  {},
                  fetchedteam.profilepicture
                    ? {
                        backgroundImage: getBgImageTeam(fetchedteam.profilepicture, size),
                        backgroundColor: "unset"
                      }
                    : fetchedteam.internaldata && fetchedteam.internaldata.color
                    ? { backgroundColor: fetchedteam.internaldata.color }
                    : { backgroundColor: "#9C13BC" },
                  props.styles || {}
                )}>
                {fetchedteam.profilepicture
                  ? ""
                  : fetchedteam.internaldata && fetchedteam.internaldata.letters
                  ? fetchedteam.internaldata.letters
                  : (fetchedteam.name && fetchedteam.name.slice(0, 1)) || ""}
              </div>
            );
          } else {
            return "";
          }
        }}
      </Query>
    );
  }
  return (
    <div
      key={team.name}
      title={title || team.name}
      className={props.className || "managerSquare"}
      style={Object.assign(
        {},
        team.profilepicture
          ? {
              backgroundImage: getBgImageTeam(team.profilepicture, size),
              backgroundColor: "unset"
            }
          : team.internaldata && team.internaldata.color
          ? { backgroundColor: team.internaldata.color }
          : { backgroundColor: "#9C13BC" },
        props.styles || {}
      )}>
      {team.profilepicture
        ? ""
        : team.internaldata && team.internaldata.letters
        ? team.internaldata.letters
        : (team.name && team.name.slice(0, 1)) || ""}
    </div>
  );
};
