import * as React from "react";

interface Props {
  team: any;
}

interface State {}

class PrintTeamSquare extends React.Component<Props, State> {
  render() {
    const { team } = this.props;
    return (
      <div
        key={team.name}
        title={team.name}
        className="managerSquare"
        style={
          team.profilepicture
            ? {
                backgroundImage:
                  team.profilepicture.indexOf("/") != -1
                    ? `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${encodeURI(
                        team.profilepicture
                      )})`
                    : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                        team.profilepicture
                      )})`,
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
