import * as React from "react";
import PrintTeamSquare from "../squares/printTeamSquare";

interface Props {
  checkFunction?: Function;
  teamidFunction: Function;
  overlayFunction?: Function;
  teams: any[];
}

interface State {}

class ColumnTeams extends React.Component<Props, State> {
  render() {
    const { teams, teamidFunction, checkFunction, overlayFunction } = this.props;
    let teamsArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < teams.length; counter++) {
      const team: {
        profilepicture: string;
        internaldata: { letters: string; color: string };
        name: string;
      } = teamidFunction(teams[counter]);
      if (teams.length > 6 && counter > 4) {
        teamsArray.push(
          <div
            key="moreTeams"
            className="managerSquare"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}>
            +{teams.length - 5}
          </div>
        );
        break;
      } else {
        teamsArray.push(<PrintTeamSquare key={`team-${counter}`} team={team} />);
      }
    }

    return <div className="tableColumnBig">{teamsArray}</div>;
  }
}
export default ColumnTeams;
