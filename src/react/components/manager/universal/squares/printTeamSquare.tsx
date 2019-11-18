import * as React from "react";
import { getBgImageTeam } from "../../../../common/images";

interface Props {
  team: any;
  className?: string | null;
  size?: number;
  title?: string;
  fake?: boolean;
}

interface State {}

class PrintTeamSquare extends React.Component<Props, State> {
  render() {
    const { team, title } = this.props;
    const size = this.props.size || 32;
    if (this.props.fake) {
      return (
        <div
          key={team.name}
          title={title || team.name}
          className={this.props.className || "managerSquare"}
          style={{
            color: "#253647",
            backgroundColor: "#F2F2F2",
            fontSize: "12px",
            fontWeight: 400
          }}
        />
      );
    }
    return (
      <div
        key={team.name}
        title={title || team.name}
        className={this.props.className || "managerSquare"}
        style={
          team.profilepicture
            ? {
                backgroundImage: getBgImageTeam(team.profilepicture, size),
                backgroundColor: "unset"
              }
            : team.internaldata && team.internaldata.color
            ? { backgroundColor: team.internaldata.color }
            : { backgroundColor: "#9C13BC" }
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
