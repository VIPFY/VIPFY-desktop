import * as React from "react";
import PrintTeamSquare from "../squares/printTeamSquare";

interface Props {
  checkFunction?: Function;
  teamidFunction: Function;
  overlayFunction?: Function;
  teams: any[];
  style?: Object;
}

interface State {
  numteams: number;
}

class ColumnTeams extends React.Component<Props, State> {
  state = { numteams: 6 };
  ref = React.createRef();

  componentDidUpdate() {
    if (
      this.ref &&
      this.ref.current &&
      Math.floor((this.ref.current.offsetWidth - 10) / 40) != this.state.numteams
    ) {
      this.setState({ numteams: Math.floor((this.ref.current.offsetWidth - 10) / 40) });
    }
  }

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
      if (teams.length > this.state.numteams && counter > this.state.numteams - 2) {
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
            +{teams.length - this.state.numteams + 1}
          </div>
        );
        break;
      } else {
        teamsArray.push(<PrintTeamSquare key={`team-${counter}`} team={team} />);
      }
    }

    return (
      <div className="tableColumnBig" style={this.props.style || {}} ref={this.ref}>
        {teamsArray}
      </div>
    );
  }
}
export default ColumnTeams;
