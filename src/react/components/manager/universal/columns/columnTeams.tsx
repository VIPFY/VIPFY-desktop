import * as React from "react";
import { TeamPicture, ThingShape } from "../../../ThingPicture";

interface Props {
  checkFunction?: Function;
  teamidFunction: Function;
  overlayFunction?: Function;
  teams: any[];
  style?: Object;
  fake?: Boolean;
  onlyids?: Boolean;
}

interface State {
  numteams: number;
}

class ColumnTeams extends React.Component<Props, State> {
  state = { numteams: 6 };
  ref = React.createRef();

  componentDidMount() {
    this.calculateNumber();
  }
  componentDidUpdate() {
    this.calculateNumber();
  }

  calculateNumber() {
    if (
      this.ref &&
      this.ref.current &&
      Math.floor(this.ref.current.offsetWidth / 40) != this.state.numteams
    ) {
      this.setState({ numteams: Math.floor(this.ref.current.offsetWidth / 40) });
    }
  }

  render() {
    const { teams, teamidFunction, checkFunction, overlayFunction } = this.props;
    let teamsArray: JSX.Element[] = [];

    if (this.props.fake) {
      const amount = Math.random() * 4 + 1;
      let fakecounter = 0;
      for (fakecounter = 0; fakecounter < Math.min(amount, this.state.numteams); fakecounter++) {
        teamsArray.push(
          <div
            key={`fake-${fakecounter}`}
            className="managerSquare animateLoading"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}
          />
        );
      }
    } else {
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
          const id = this.props.onlyids ? team : team.unitid.id;
          teamsArray.push(
            <TeamPicture
              id={id}
              shape={ThingShape.Square}
              size={32}
              key={`team-${id}`}
            />
          );
        }
      }
    }

    return (
      <div className="iconCollectionHolder" style={this.props.style || {}} ref={this.ref}>
        {teamsArray}
      </div>
    );
  }
}
export default ColumnTeams;
