import * as React from "react";
import UniversalButton from "../universalButtons/universalButton";

interface Props {
  username: string;
}

interface State {}

class DataNextForm extends React.Component<Props, State> {
  state: {};
  render() {
    return (
      <div className="dataGeneralForm">
        <div className="logo" />
        <h1>Hi {this.props.username}!</h1>
        <p>
          Nice to meet you. We are happy that you choose VIPFY as
          <br />
          your Businessplatform. What do you want to do first?
        </p>
        <div className="threeIllustrationHolder">
          <div className="thirdHolder">
            <div className="smallillu" />
            <h2>Suggestions for services</h2>
            <p>
              You search for servcies but
              <br />
              are not completly sure which?
            </p>
            <div className="buttonHolder">
              <UniversalButton label="Continue" type="high" />
            </div>
          </div>
          <div className="thirdHolder">
            <div className="smallillu" />
            <h2>Integrate existing accounts</h2>
            <p>
              You already have accounts and
              <br />
              want to set up Single Sign-On?
            </p>
            <div className="buttonHolder">
              <UniversalButton label="Continue" type="high" />
            </div>
          </div>
          <div className="thirdHolder">
            <div className="smallillu" />
            <h2>Just look around</h2>
            <p>
              You want to get an overview
              <br />
              of what VIPFY is capable of?
            </p>
            <div className="buttonHolder">
              <UniversalButton label="Continue" type="high" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default DataNextForm;
