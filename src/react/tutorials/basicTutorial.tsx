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
    step: null,
    references: this.props.renderElements || [],
    tutorialprogress:
      this.props.tutorialdata &&
      this.props.tutorialdata.me &&
      this.props.tutorialdata.me.tutorialprogress
        ? this.props.tutorialdata.me.tutorialprogress
        : {
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

  static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null {
    function checkstep(step, first = true) {
      let s = -1;
      if (!step) {
        if (nextProps.tutorialdata.me.tutorialprogress[prevState.page]) {
          console.log("1");
          s = nextProps.tutorialdata.me.tutorialprogress[prevState.page];
        } else if (prevState.page === "welcome" && first) {
          console.log("2");
          s = nextProps.tutorialdata.me.tutorialprogress[nextProps.page];
        } else if (nextProps.tutorialdata.me.tutorialprogress.sidebar) {
          console.log("3");
          s = nextProps.tutorialdata.me.tutorialprogress.sidebar;
        } else {
          console.log("4");
          return -1;
        }
        return checkstep(s, false);
      } else {
        return step;
      }
    }

    console.log("UPDATE FROM PROPS", nextProps, prevState);
    if (
      (nextProps.tutorialdata &&
        nextProps.tutorialdata.me &&
        nextProps.tutorialdata.me.tutorialprogress) ||
      nextProps.renderElements
    ) {
      const r = checkstep(prevState.step);
      console.log("CHECKSTEP", r);

      console.log("UPDATE IN STATE");
      const o = {
        ...prevState,
        tutorialprogress:
          nextProps.tutorialdata &&
          nextProps.tutorialdata.me &&
          nextProps.tutorialdata.me.tutorialprogress
            ? nextProps.tutorialdata.me.tutorialprogress
            : {
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
              },
        references: nextProps.renderElements || [],
        step: r
      };

      console.log("UPDATE IN STATE2", o);
      return o;
    } else {
      return prevState;
    }
  }

  nextClick = step => {
    console.log("NEXT CLICK", this.state);
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
  };

  closeTutorial = async () => {
    const a = await this.props.updateTutorialProgress({
      variables: { tutorialprogress: this.state.tutorialprogress }
    });
    console.log("UPDATE STATE", a);
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
    this.props.showTutorial(false);
  };

  renderTutorial = (step, state) => {
    let s = this.state.step;
    const steps = this.props.tutorialdata ? this.props.tutorialdata.tutorialSteps : [];
    let references = this.state.references;
    if (steps && steps[0]) {
      const { steptext, renderoptions, nextstep } = steps.find(e => e.id == s);
      if (references.find(e => e.key == renderoptions.highlightelement)) {
        switch (renderoptions.align) {
          case "left":
            references.find(e => e.key == renderoptions.highlightelement)!.element.style.zIndex =
              "20000";
            references.find(
              e => e.key === renderoptions.highlightelement
            )!.element.style.boxShadow = "0px 0px 15px 0px white";
            console.log(
              "LEFT:",
              references.find(e => e.key === renderoptions.highlightelement)
                ? references.find(e => e.key === renderoptions.highlightelement)!.element.offsetTop
                : "",
              references.find(e => e.key === renderoptions.highlightelement)
                ? references.find(e => e.key === renderoptions.highlightelement)!.element
                    .offsetLeft +
                    references.find(e => e.key === renderoptions.highlightelement)!.element
                      .offsetWidth
                : ""
            );
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
      } else {
        //this.closeTutorial();
      }
    }
  };

  componentDidUpdate() {
    console.log("UPDATE", this.props.renderElements);

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
    console.log("START TUT", this.props);
    return <div id="overlay">{this.renderTutorial(this.state.step, this.state)}</div>;
  }
}

export default compose(
  graphql(updateTutorialProgress, {
    name: "updateTutorialProgress"
  })
)(Tutorial);
