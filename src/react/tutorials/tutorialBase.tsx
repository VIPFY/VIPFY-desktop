import * as React from "react";
import TutorialsIntro from "./tutorialsIntro";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import { CLOSE_TUTORIAL } from "../mutations/auth";
import { me } from "./../queries/auth";

interface Props {
  tutorialId?: number;
  closeTutorial: Function;
  highlightReferences: any[];
}

interface State {
  tutorialId: number;
}

class TutorialBase extends React.Component<Props, State> {
  state: State = {
    tutorialId: this.props.tutorialId || 0
  };

  goToTutorial = id => this.setState({ tutorialId: id });
  closeTutorial = async variables => {
    await this.props.closeTutorial({
      variables: { ...variables },
      refetchQueries: [
        {
          query: me
        }
      ]
    });
  };

  render() {
    if (!this.props.tutorialprogress.intro || this.props.tutorialprogress.intro != "closed") {
      return (
        <TutorialsIntro
          references={this.props.highlightReferences}
          goToTutorial={this.goToTutorial}
          closeTutorial={this.closeTutorial}
          tutorialId={this.state.tutorialId}
        />
      );
    } else {
      return "";
    }
  }
}

export default compose(
  graphql(CLOSE_TUTORIAL, {
    name: "closeTutorial"
  })
)(TutorialBase);
