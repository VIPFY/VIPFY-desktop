import * as React from "react";
import { getBgImageTeam } from "../../../../common/images";

interface Props {
  team: any;
  className?: string | null;
  size?: number;
}

interface State {}

class PrintTeamSquare extends React.Component<Props, State> {
  render() {
    const { team } = this.props;
    const size = this.props.size || 32;
    return (
      <div
        key={team.name}
        title={team.name}
        className={this.props.className || "managerSquare"}
        style={
          team.profilepicture
            ? {
                backgroundImage: getBgImageTeam(team.profilepicture, size),
                backgroundColor: "unset"
              }
            : team.internaldata && team.internaldata.color
            ? { backgroundColor: team.internaldata.color }
            : {}
        }>
        {team.profilepicture
          ? ""
          : team.internaldata && team.internaldata.letters
          ? team.internaldata.letters
          : team.name.slice(0, 1)}
      </div>
    );
  }
}
export default PrintTeamSquare;
