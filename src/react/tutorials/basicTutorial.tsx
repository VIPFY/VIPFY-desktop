import * as React from "react";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";

interface Props {
  tutorialdata: any[];
  renderElements: { key: string; element: any }[];
  showTutorial: Function;
  page: string;
  updateTutorialProgress: Function;
}

interface State {}

const updateTutorialProgress = gql`
  mutation updateTutorialProgress($tutorialprogress: JSON!) {
    updateTutorialProgress(tutorialprogress: $tutorialprogress) {
      ok
    }
  }
`;

class Tutorial extends React.Component<Props, State> {
  state = {
    page: "welcome",
    propspage: this.props.page,
    step: 1,
    tutorialprogress: {
      welcome: 1,
      sidebar: 2,
      dashboard: 11,
      profile: null,
      billing: null,
      security: null,
      team: 12,
      marketplace: null,
      external: null,
      support: null,
      appadmin: null
    }
  };
  nextClick = step => {
    const references = this.props.renderElements;
    const steps = this.props.tutorialdata.tutorialSteps;

    if (steps && steps[0]) {
      console.log("Remove Highlights for ", this.state.step);
      const { renderoptions } = steps.find(e => e.id == this.state.step);
      if (renderoptions.highlightelement) {
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex = "";
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
          "";
      }
    }

    if (step) {
      let updatedprogress = this.state.tutorialprogress;
      updatedprogress[this.state.page] = step;
      this.setState({ step, tutorialprogress: updatedprogress });
    } else {
      let updatedprogress = this.state.tutorialprogress;
      updatedprogress[this.state.page] = null;
      this.setState({ tutorialprogress: updatedprogress });

      if (this.state.tutorialprogress[this.state.page]) {
        this.setState({
          step: this.state.tutorialprogress[this.state.page],
          page: this.state.page
        });
      } else if (this.state.page === "welcome") {
        this.setState({
          step: this.state.tutorialprogress[this.props.page],
          page: this.props.page
        });
      } else if (this.state.tutorialprogress.sidebar) {
        this.setState({ step: this.state.tutorialprogress.sidebar, page: "sidebar" });
      } else {
        this.closeTutorial();
      }
    }

    /*if ((!step || step == 0) && page !== "sidebar") {
      switch (page) {
        case "dashboard":
          step = 7;
          break;
        case "profile":
          step = 8;
          break;
        case "billing":
          step = 9;
          break;
        case "security":
          step = 10;
          break;
        case "team":
          step = 0;
          break;
        default:
          step = 0;
      }
      this.setState({ step, page: "sidebar" });
    }
    if (step) {
      this.setState({ step });
      this.props.renderTutorial(step);
    } else {
      this.setState({ step: 0 });
      this.props.renderTutorial(0);
    }*/
  };

  closeTutorial = async () => {
    const a = await this.props.updateTutorialProgress({
      variables: { tutorialprogress: this.state.tutorialprogress }
    });
    console.log("UPDATE STATE", a);
    this.props.showTutorial(false);
  };

  renderTutorial = step => {
    let s = this.state.step;
    const steps = this.props.tutorialdata ? this.props.tutorialdata.tutorialSteps : [];
    const references = this.props.renderElements;

    /*if (this.state.page !== page) {
      if (steps && steps[0]) {
        const st = this.state.step;
        const { renderoptions } = steps.find(e => e.id == st);
        if (renderoptions.highlightelement) {
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex = "";
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
            "";
        }
      }
      switch (page) {
        case "dashboard":
          s = 11;
          break;
        case "team":
          s = 12;
          break;
        default:
          s = 1;
      }
      this.setState({ step: s, page });
    }*/

    console.log("RENDER", this.state);
    s = this.state.step;
    if (steps && steps[0]) {
      const { steptext, renderoptions, nextstep } = steps.find(e => e.id == s);
      switch (renderoptions.align) {
        case "left":
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex =
            "20000";
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          return (
            <div
              className="tutorialPopupLeft"
              style={{
                top: references.find(e => e.key === renderoptions.highlightelement)
                  ? references.find(e => e.key === renderoptions.highlightelement)!.element
                      .offsetTop
                  : "",
                left: references.find(e => e.key === renderoptions.highlightelement)
                  ? references.find(e => e.key === renderoptions.highlightelement)!.element
                      .offsetLeft +
                    references.find(e => e.key === renderoptions.highlightelement)!.element
                      .offsetWidth
                  : ""
              }}>
              <div dangerouslySetInnerHTML={{ __html: steptext }} />
              <div
                className="holder-button"
                style={{
                  justifyContent:
                    this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
                }}>
                {this.state.page !== "sidebar" || nextstep ? (
                  <button
                    className="naked-button generic-button cancel-button"
                    onClick={() => this.closeTutorial()}>
                    End Tutorial
                  </button>
                ) : (
                  ""
                )}
                <button
                  className="naked-button generic-button next-button"
                  onClick={() => this.nextClick(nextstep)}>
                  {renderoptions.nexttext}
                </button>
              </div>
            </div>
          );
          break;
        default:
          return (
            <div className="tutorialPopup">
              <div dangerouslySetInnerHTML={{ __html: steptext }} />
              <div
                className="holder-button"
                style={{
                  justifyContent:
                    this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
                }}>
                {this.state.page !== "sidebar" || nextstep ? (
                  <button
                    className="naked-button generic-button cancel-button"
                    onClick={() => this.closeTutorial()}>
                    End Tutorial
                  </button>
                ) : (
                  ""
                )}
                <button
                  className="naked-button generic-button next-button"
                  onClick={() => this.nextClick(nextstep)}>
                  {renderoptions.nexttext}
                </button>
              </div>
            </div>
          );
      }
    }
  };

  componentDidUpdate() {
    console.log("UPDATE");

    console.log("TUTPROPS", this.props);
    if (
      this.state.propspage !== this.props.page &&
      this.state.page !== "welcome" &&
      this.state.tutorialprogress[this.props.page]
    ) {
      console.log("Update", this.state.page, this.props.page);
      const references = this.props.renderElements;

      const steps = this.props.tutorialdata ? this.props.tutorialdata.tutorialSteps : [];
      const currentstep = this.state.step;
      const currentpage = this.state.page;

      if (steps && steps[0]) {
        console.log("Remove Highlights for ", currentstep);
        const { renderoptions } = steps.find(e => e.id == currentstep);
        console.log("Remove Highlights for ", currentstep, renderoptions, references);
        if (renderoptions.highlightelement) {
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex = "";
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
            "";
          console.log(
            "ZINDEX",
            references.find(e => e.key === renderoptions.highlightelement)!.element.style
          );
        }
      }
      const nextstep = steps.find(e => e.id == currentstep).nextstep;

      let updatedprogress = this.state.tutorialprogress;
      updatedprogress[currentpage] = nextstep;
      this.setState({
        propspage: this.props.page,
        page: this.props.page,
        step: this.state.tutorialprogress[this.props.page],
        tutorialprogress: updatedprogress
      });
    }
  }

  render() {
    return <div id="overlay">{this.renderTutorial(this.state.step)}</div>;
  }
}

export default compose(
  graphql(updateTutorialProgress, {
    name: "updateTutorialProgress"
  })
)(Tutorial);
