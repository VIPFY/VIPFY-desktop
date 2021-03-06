import * as React from "react";
import { graphql } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";

interface Props {
  tutorialdata: any[];
  renderElements: { key: string; element: any }[];
  page: string;
  updateTutorialProgress: Function;
  reshow: string | null;
  setreshowTutorial: Function;
}

interface State { }

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
    tutorialprogress: /*this.props.tutorialdata &&
      this.props.tutorialdata.me &&
      this.props.tutorialdata.me.tutorialprogress
        ? this.props.tutorialdata.me.tutorialprogress
        :*/ {
      welcome: 1,
      sidebar: 2,
      dashboard: 11,
      profile: 18,
      billing: null,
      security: null,
      team: 12,
      marketplace: null,
      external: null,
      support: null,
      appadmin: null
    },
    tutorialSave: {}
  };

  sectionsStarts = {
    welcome: 1,
    sidebar: 2,
    dashboard: 11,
    profile: 18
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State): State | null {
    const sectionsStarts = {
      welcome: 1,
      sidebar: 2,
      dashboard: 11,
      profile: 18
    };
    function checkstep(step, first = true) {
      let s = -1;
      if (!step) {
        if (
          nextProps.tutorialdata &&
          nextProps.tutorialdata.me &&
          nextProps.tutorialdata.me.tutorialprogress &&
          nextProps.tutorialdata.me.tutorialprogress[prevState.page]
        ) {
          s = nextProps.tutorialdata.me.tutorialprogress[prevState.page];
        } else if (
          nextProps.tutorialdata &&
          nextProps.tutorialdata.me &&
          nextProps.tutorialdata.me.tutorialprogress &&
          prevState.page === "welcome" &&
          first
        ) {
          s = nextProps.tutorialdata.me.tutorialprogress[nextProps.page];
        } else if (
          nextProps.tutorialdata &&
          nextProps.tutorialdata.me &&
          nextProps.tutorialdata.me.tutorialprogress &&
          nextProps.tutorialdata.me.tutorialprogress.sidebar
        ) {
          s = nextProps.tutorialdata.me.tutorialprogress.sidebar;
        } else {
          return sectionsStarts[prevState.page];
        }
        return checkstep(s, false);
      } else {
        return step;
      }
    }
    if (
      (nextProps.tutorialdata &&
        nextProps.tutorialdata.me &&
        nextProps.tutorialdata.me.tutorialprogress) ||
      nextProps.renderElements ||
      nextProps.reshow
    ) {
      let r = 1;
      r = nextProps.reshow ? sectionsStarts[nextProps.reshow] : checkstep(prevState.step);
      const page = nextProps.reshow ? nextProps.reshow : prevState.page;
      const o = {
        ...prevState,
        page,
        tutorialprogress: {
          welcome: 1,
          sidebar: 2,
          dashboard: 11,
          profile: 18,
          billing: null,
          security: null,
          team: 12,
          marketplace: null,
          external: null,
          support: null,
          appadmin: null
        },
        references: nextProps.renderElements || [],
        step: r,
        tutorialSave:
          nextProps.tutorialdata &&
            nextProps.tutorialdata.me &&
            nextProps.tutorialdata.me.tutorialprogress
            ? nextProps.tutorialdata.me.tutorialprogress
            : prevState.tutorialSave
      };
      return o;
    } else {
      return prevState;
    }
  }

  endSection = async section => {
    const a = await this.props.updateTutorialProgress({
      variables: { tutorialprogress: { ...this.state.tutorialSave, [section]: true } }
    });
    await this.setState(prevState => {
      const newstate = {
        ...prevState,
        tutorialSave: {
          ...prevState.tutorialSave,
          [section]: true
        }
      };
      return newstate;
    });
  };

  nextClick = step => {
    const references = this.props.renderElements;
    const steps = this.props.tutorialdata.tutorialSteps;

    if (steps && steps[0]) {
      const { renderoptions } = steps.find(e => e.id == this.state.step);
      if (renderoptions.highlightelement) {
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex = "";
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
          "";
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.position = "";
      }
    }

    if (step) {
      let updatedprogress = this.state.tutorialprogress;
      updatedprogress[this.state.page] = step;
      this.setState({ step, tutorialprogress: updatedprogress });
    } else {
      //NEW SAVE FOR END OF SECTION
      this.endSection(this.state.page);
      if (this.props.reshow) {
        this.props.setreshowTutorial(null);
        return;
      }
      //END NEW SAVE FOR END OF SECTION

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
          step: this.sectionsStarts[this.props.page],
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
      variables: { tutorialprogress: { ...this.state.tutorialSave, closed: true } }
    });
    this.setState({ tutorialSave: { ...this.state.tutorialSave, closed: true } });
    const references = this.props.renderElements;
    const steps = this.props.tutorialdata.tutorialSteps;
    if (steps && steps[0]) {
      const { renderoptions } = steps.find(e => e.id == this.state.step);
      if (
        renderoptions.highlightelement &&
        references.find(e => e.key === renderoptions.highlightelement)
      ) {
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex = "";
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
          "";
        references.find(e => e.key === renderoptions.highlightelement)!.element.style.position = "";
      }
    }
    this.props.setreshowTutorial(null);
  };

  showSteps = steps => {
    let stepArray: JSX.Element[] = [];
    const stepsa = steps.filter(s => s.page == this.state.page);
    stepsa.sort((a, b) => a.renderoptions.orderkey > b.renderoptions.orderkey);
    stepsa.forEach(s => {
      stepArray.push(
        <button
          key={`bc-${s.id}`}
          className="naked-button round-button"
          onClick={() => this.nextClick(s.id)}>
          {s.id == this.state.step ? "x" : "o"}
        </button>
      );
    });
    return stepArray;
  };

  calculateTop = (element, addedmargin, middle = 1) => {
    let top = addedmargin + element.offsetTop + (middle * element.offsetHeight) / 2;
    if (element.offsetParent != document.body) {
      top += this.calculateTop(element.offsetParent, 0, 0);
    }
    return top;
  };

  calculateLeft = (element, addedmargin, middle = 1, right = false) => {
    let left = addedmargin + element.offsetLeft + (middle * element.offsetWidth) / 2;
    if (element.offsetParent != document.body) {
      left += this.calculateLeft(element.offsetParent, 0, 0);
    }
    if (right) {
      left -= 540;
    }
    return left;
  };

  renderTutorial = (step, state) => {
    let s = this.state.step;
    const steps = this.props.tutorialdata ? this.props.tutorialdata.tutorialSteps : [];
    let references = this.state.references;
    if (steps && steps[0] && this.state.step) {
      const { steptext, renderoptions, nextstep } = steps.find(e => e.id == s);
      const stepcount = steps.filter(s => s.page == this.state.page).length;
      if (references.find(e => e.key == renderoptions.highlightelement)) {
        switch (renderoptions.align) {
          case "left":
            references.find(e => e.key == renderoptions.highlightelement)!.element.style.zIndex =
              "20000";
            references.find(
              e => e.key === renderoptions.highlightelement
            )!.element.style.boxShadow = "0px 0px 15px 0px white";
            if (!renderoptions.norelative) {
              references.find(
                e => e.key === renderoptions.highlightelement
              )!.element.style.position = "relative";
            }
            return (
              <div
                className="tutorialPopupLeft"
                style={{
                  top: references.find(e => e.key === renderoptions.highlightelement)
                    ? this.calculateTop(
                      references.find(e => e.key === renderoptions.highlightelement)!.element,
                      -10
                    )
                    : "",
                  left: references.find(e => e.key === renderoptions.highlightelement)
                    ? this.calculateLeft(
                      references.find(e => e.key === renderoptions.highlightelement)!.element,
                      0,
                      2
                    )
                    : ""
                }}>
                <div className="tutorialCloseButton" onClick={() => this.closeTutorial()}>
                  <i className="fas fa-times" />
                </div>
                <div className="tutorialContent" dangerouslySetInnerHTML={{ __html: steptext }} />
                <div
                  className="holder-button"
                  style={{
                    justifyContent:
                      this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
                  }}>
                  {renderoptions.backstep ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.nextClick(renderoptions.backstep)}>
                      Back
                    </button>
                  ) : (
                      ""
                    )}
                  {renderoptions.bigclose ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.closeTutorial()}>
                      Skip Tutorial
                    </button>
                  ) : (
                      ""
                    )}
                  <div className="tutorialSectionHolder">
                    <div className="tutorialSectionShower">{this.state.page}</div>
                    {stepcount > 1 ? (
                      <div className="tutorialSectionShower">{this.showSteps(steps)}</div>
                    ) : (
                        <div className="tutorialSectionShower" />
                      )}
                  </div>
                  <button
                    className="naked-button generic-button next-button"
                    onClick={() => this.nextClick(nextstep)}>
                    {this.props.reshow && !nextstep ? "End Tutorial" : renderoptions.nexttext}
                  </button>
                </div>
              </div>
            );
            break;
          case "below":
            references.find(e => e.key == renderoptions.highlightelement)!.element.style.zIndex =
              "20000";
            references.find(
              e => e.key === renderoptions.highlightelement
            )!.element.style.boxShadow = "0px 0px 15px 0px white";
            if (!renderoptions.norelative) {
              references.find(
                e => e.key === renderoptions.highlightelement
              )!.element.style.position = "relative";
            }
            return (
              <div
                className="tutorialPopupBelow"
                style={{
                  top: references.find(e => e.key === renderoptions.highlightelement)
                    ? this.calculateTop(
                      references.find(e => e.key === renderoptions.highlightelement)!.element,
                      30,
                      2
                    )
                    : "",
                  left: references.find(e => e.key === renderoptions.highlightelement)
                    ? this.calculateLeft(
                      references.find(e => e.key === renderoptions.highlightelement)!.element,
                      10,
                      0
                    )
                    : ""
                }}>
                <div className="tutorialCloseButton" onClick={() => this.closeTutorial()}>
                  <i className="fas fa-times" />
                </div>
                <div className="tutorialContent" dangerouslySetInnerHTML={{ __html: steptext }} />
                <div
                  className="holder-button"
                  style={{
                    justifyContent:
                      this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
                  }}>
                  {renderoptions.backstep ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.nextClick(renderoptions.backstep)}>
                      Back
                    </button>
                  ) : (
                      ""
                    )}
                  {renderoptions.bigclose ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.closeTutorial()}>
                      Skip Tutorial
                    </button>
                  ) : (
                      ""
                    )}
                  <div className="tutorialSectionHolder">
                    <div className="tutorialSectionShower">{this.state.page}</div>
                    {stepcount > 1 ? (
                      <div className="tutorialSectionShower">{this.showSteps(steps)}</div>
                    ) : (
                        <div className="tutorialSectionShower" />
                      )}
                  </div>
                  <button
                    className="naked-button generic-button next-button"
                    onClick={() => this.nextClick(nextstep)}>
                    {this.props.reshow && !nextstep ? "End Tutorial" : renderoptions.nexttext}
                  </button>
                </div>
              </div>
            );
            break;

          case "belowright":
            //for boxes below aligned to the right

            references.find(e => e.key == renderoptions.highlightelement)!.element.style.zIndex =
              "20000";
            references.find(
              e => e.key === renderoptions.highlightelement
            )!.element.style.boxShadow = "0px 0px 15px 0px white";
            if (!renderoptions.norelative) {
              references.find(
                e => e.key === renderoptions.highlightelement
              )!.element.style.position = "relative";
            }
            return (
              <div
                className="tutorialPopupBelowRight"
                style={{
                  top: references.find(e => e.key === renderoptions.highlightelement)
                    ? this.calculateTop(
                      references.find(e => e.key === renderoptions.highlightelement)!.element,
                      30,
                      2
                    )
                    : "",
                  left: references.find(e => e.key === renderoptions.highlightelement)
                    ? this.calculateLeft(
                      references.find(e => e.key === renderoptions.highlightelement)!.element,
                      0,
                      2,
                      true
                    )
                    : ""
                }}>
                <div className="tutorialCloseButton" onClick={() => this.closeTutorial()}>
                  <i className="fas fa-times" />
                </div>
                <div className="tutorialContent" dangerouslySetInnerHTML={{ __html: steptext }} />
                <div
                  className="holder-button"
                  style={{
                    justifyContent:
                      this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
                  }}>
                  {renderoptions.backstep ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.nextClick(renderoptions.backstep)}>
                      Back
                    </button>
                  ) : (
                      ""
                    )}
                  {renderoptions.bigclose ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.closeTutorial()}>
                      Skip Tutorial
                    </button>
                  ) : (
                      ""
                    )}
                  <div className="tutorialSectionHolder">
                    <div className="tutorialSectionShower">{this.state.page}</div>
                    {stepcount > 1 ? (
                      <div className="tutorialSectionShower">{this.showSteps(steps)}</div>
                    ) : (
                        <div className="tutorialSectionShower" />
                      )}
                  </div>
                  <button
                    className="naked-button generic-button next-button"
                    onClick={() => this.nextClick(nextstep)}>
                    {this.props.reshow && !nextstep ? "End Tutorial" : renderoptions.nexttext}
                  </button>
                </div>
              </div>
            );
            break;

          default:
            return (
              <div className="tutorialPopup">
                <div className="tutorialCloseButton" onClick={() => this.closeTutorial()}>
                  <i className="fas fa-times" />
                </div>
                <div className="tutorialContent" dangerouslySetInnerHTML={{ __html: steptext }} />
                <div
                  className="holder-button"
                  style={{
                    justifyContent:
                      this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
                  }}>
                  {renderoptions.backstep ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.nextClick(renderoptions.backstep)}>
                      Back
                    </button>
                  ) : (
                      ""
                    )}
                  {renderoptions.bigclose ? (
                    <button
                      className="naked-button generic-button back-button"
                      onClick={() => this.closeTutorial()}>
                      Skip Tutorial
                    </button>
                  ) : (
                      ""
                    )}
                  <div className="tutorialSectionHolder">
                    <div className="tutorialSectionShower">{this.state.page}</div>
                    {stepcount > 1 ? (
                      <div className="tutorialSectionShower">{this.showSteps(steps)}</div>
                    ) : (
                        <div className="tutorialSectionShower" />
                      )}
                  </div>
                  <button
                    className="naked-button generic-button next-button"
                    onClick={() => this.nextClick(nextstep)}>
                    {this.props.reshow && !nextstep ? "End Tutorial" : renderoptions.nexttext}
                  </button>
                </div>
              </div>
            );
        }
      } else {
        return (
          <div className="tutorialPopup">
            <div className="tutorialCloseButton" onClick={() => this.closeTutorial()}>
              <i className="fas fa-times" />
            </div>
            <div className="tutorialContent" dangerouslySetInnerHTML={{ __html: steptext }} />
            <div
              className="holder-button"
              style={{
                justifyContent:
                  this.state.page !== "sidebar" || nextstep ? "space-between" : "flex-end"
              }}>
              {renderoptions.backstep ? (
                <button
                  className="naked-button generic-button back-button"
                  onClick={() => this.nextClick(renderoptions.backstep)}>
                  Back
                </button>
              ) : (
                  ""
                )}
              {renderoptions.bigclose ? (
                <button
                  className="naked-button generic-button back-button"
                  onClick={() => this.closeTutorial()}>
                  Skip Tutorial
                </button>
              ) : (
                  ""
                )}
              <div className="tutorialSectionHolder">
                <div className="tutorialSectionShower">{this.state.page}</div>
                {stepcount > 1 ? (
                  <div className="tutorialSectionShower">{this.showSteps(steps)}</div>
                ) : (
                    <div className="tutorialSectionShower" />
                  )}
              </div>
              <button
                className="naked-button generic-button next-button"
                onClick={() => this.nextClick(nextstep)}>
                {this.props.reshow && !nextstep ? "End Tutorial" : renderoptions.nexttext}
              </button>
            </div>
          </div>
        );
      }
    }
  };

  componentDidUpdate() {
    if (
      this.state.propspage !== this.props.page &&
      this.state.page !== "welcome" &&
      this.state.tutorialprogress[this.props.page] &&
      !this.props.reshow
    ) {
      const references = this.props.renderElements;

      const steps = this.props.tutorialdata ? this.props.tutorialdata.tutorialSteps : [];
      const currentstep = this.state.step;
      const currentpage = this.state.page;

      if (steps && steps[0]) {
        const { renderoptions } = steps.find(e => e.id == currentstep);
        if (
          renderoptions.highlightelement &&
          references.find(e => e.key === renderoptions.highlightelement).element
        ) {
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.zIndex = "";
          references.find(e => e.key === renderoptions.highlightelement)!.element.style.boxShadow =
            "";
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
    if (this.state.tutorialSave == {} || (this.state.tutorialSave.closed && !this.props.reshow)) {
      return "";
    } else {
      return <div id="overlay">{this.renderTutorial(this.state.step, this.state)}</div>;
    }
  }
}

export default compose(
  graphql(updateTutorialProgress, {
    name: "updateTutorialProgress"
  })
)(Tutorial);
