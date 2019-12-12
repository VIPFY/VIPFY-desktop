import * as React from "react";
import { getBgImageTeam } from "../../../../common/images";

interface Props {
  team: any;
  className?: string | null;
  size?: number;
  title?: string;
  fake?: boolean;
  styles?: Object;
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
        style={Object.assign(
          { ...(props.styles || {}) },

          team.profilepicture
            ? {
                backgroundImage: getBgImageTeam(team.profilepicture, size) || "unset",
                backgroundColor: "unset"
              }
            : team.internaldata && team.internaldata.color
            ? { backgroundColor: team.internaldata.color }
            : { backgroundColor: "#9C13BC" }
        )}>
        {team.profilepicture
          ? ""
          : team.internaldata && team.internaldata.letters
          ? team.internaldata.letters
          : team.name.slice(0, 1)}
      </div>
    );
  }
  return (
    <div
      key={team.name}
      title={title || team.name}
      className={props.className || "managerSquare"}
      style={
        team.profilepicture
          ? {
              backgroundImage: getBgImageTeam(team.profilepicture, size),
              backgroundColor: "unset"
            }
          : team.internaldata && team.internaldata.color
          ? { backgroundColor: team.internaldata.color }
          : { backgroundColor: "#5d76ff" }
      }>
      {team.profilepicture
        ? ""
        : team.internaldata && team.internaldata.letters
        ? team.internaldata.letters
        : team.name.slice(0, 1)}
    </div>
  );
};
