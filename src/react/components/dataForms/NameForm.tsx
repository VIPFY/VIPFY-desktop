import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";

interface Props {}

interface State {
  name: string;
}

class DataNameForm extends React.Component<Props, State> {
  state = {
    name: ""
  };

  render() {
    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1>Welcome to VIPFY</h1>
        <p>
          Now that you signed up, let's personalize your experience.
          <br />
          First of all, what's your Name?
        </p>
        <div className="inputHolder">
          <input
            value={this.state.name}
            placeholder="My name is:"
            onChange={e => this.setState({ name: e.target.value })}
          />
        </div>
        <div className="oneIllustrationHolder" />
        <div className="buttonHolder">
          <UniversalButton label="Continue" type="high" disabeld={this.state.name == ""} />
        </div>
      </div>
    );
  }
}
export default DataNameForm;
