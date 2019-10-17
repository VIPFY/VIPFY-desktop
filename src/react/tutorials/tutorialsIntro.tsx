import * as React from "react";
import PopupBase from "../popups/universalPopups/popupBase";
import { AppContext, sleep } from "../common/functions";

interface Props {
  references: any[];
  tutorialId: number;
  goToTutorial: Function;
  closeTutorial: Function;
}

interface State {}

class TutorialsIntro extends React.Component<Props, State> {
  state: State = {};

  calculateTop = (element, addedmargin, middle = 1) => {
    if (element) {
      let top = addedmargin + element.offsetTop + (middle * element.offsetHeight) / 2;
      if (element.offsetParent != document.body) {
        top += this.calculateTop(element.offsetParent, 0, 0);
      }
      console.log("CalcTop", element, top);
      return top;
    } else {
      return 0;
    }
  };

  calculateLeft = (element, addedmargin, middle = 1, right = false) => {
    if (element) {
      let left = addedmargin + element.offsetLeft + (middle * element.offsetWidth) / 2;
      if (element.offsetParent != document.body) {
        left += this.calculateLeft(element.offsetParent, 0, 0);
      }
      if (right) {
        left -= 540;
      }
      return left;
    } else {
      return 0;
    }
  };

  sidebarClick = () => this.props.goToTutorial(2);
  addEmpClick = () => this.props.goToTutorial(3);
  continueClick = e => {
    console.log("CClick", e.target.className);
    if (!e.target.className.includes("disabled")) {
      this.props.goToTutorial(4);
    }
  };
  manageServicesNext = () => {
    console.log("NEXT");
    this.props.goToTutorial(5);
  };
  closeTutorial = () => this.props.goToTutorial(6);

  close = a => {
    const { references, closeTutorial } = this.props;
    if (
      references.find(e => e.key == "emanager") &&
      references.find(e => e.key == "emanager")!.element
    ) {
      references.find(e => e.key == "emanager")!.element.style.zIndex = "";
      references.find(e => e.key === "emanager")!.element.style.boxShadow = "";
      references.find(e => e.key === "emanager")!.element.style.position = "";
      references
        .find(e => e.key === "emanager")!
        .element.removeEventListener("click", this.sidebarClick);
    }
    if (
      references.find(e => e.key == "addEmp") &&
      references.find(e => e.key == "addEmp")!.element
    ) {
      references.find(e => e.key == "addEmp")!.element.style.zIndex = "";
      references.find(e => e.key === "addEmp")!.element.style.boxShadow = "";
      references.find(e => e.key === "addEmp")!.element.style.position = "";
      references
        .find(e => e.key === "addEmp")!
        .element.removeEventListener("click", this.addEmpClick);
    }

    if (
      references.find(e => e.key == "addEmpPopup") &&
      references.find(e => e.key == "addEmpPopup")!.element
    ) {
      references.find(e => e.key == "addEmpPopup")!.element.style.zIndex = "";
      references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow = "";
      references.find(e => e.key === "addEmpPopup")!.element.style.position = "";

      references.find(e => e.key == "addEmpPopup")!.element.style.top = "";
      references.find(e => e.key == "addEmpPopup")!.element.style.left = "";
      references.find(
        e => e.key === "addEmpPopup"
      )!.element.parentElement.parentElement.style.position = "fixed";
    }
    if (references.find(e => e.key == "saved") && references.find(e => e.key == "saved")!.element) {
      references
        .find(e => e.key === "saved")!
        .element.removeEventListener("click", this.continueClick);
    }

    if (
      references.find(e => e.key == "manageTeamsPopup") &&
      references.find(e => e.key == "manageTeamsPopup")!.element
    ) {
      references.find(e => e.key == "manageTeamsPopup")!.element.style.zIndex = "";
      references.find(e => e.key === "manageTeamsPopup")!.element.style.boxShadow = "";
      references.find(e => e.key === "manageTeamsPopup")!.element.style.position = "";

      references.find(e => e.key == "manageTeamsPopup")!.element.style.top = "";
      references.find(e => e.key == "manageTeamsPopup")!.element.style.left = "";
      references.find(
        e => e.key === "manageTeamsPopup"
      )!.element.parentElement.parentElement.style.position = "fixed";
    }
    if (
      references.find(e => e.key == "manageServicesNext") &&
      references.find(e => e.key == "manageServicesNext")!.element
    ) {
      references
        .find(e => e.key === "manageServicesNext")!
        .element.removeEventListener("click", this.manageServicesNext);
    }
    if (references.find(e => e.key == "close") && references.find(e => e.key == "close")!.element) {
      console.log("close-ELEMENT", references.find(e => e.key == "close"));
      references
        .find(e => e.key === "close")!
        .element.removeEventListener("click", this.closeTutorial);
    }
    if (
      references.find(e => e.key == "manageTeamsPopup") &&
      references.find(e => e.key == "manageTeamsPopup")!.element
    ) {
      references.find(e => e.key == "manageTeamsPopup")!.element.style.zIndex = "";
      references.find(e => e.key === "manageTeamsPopup")!.element.style.boxShadow = "";
      references.find(e => e.key === "manageTeamsPopup")!.element.style.position = "";

      references.find(e => e.key == "manageTeamsPopup")!.element.style.top = "";
      references.find(e => e.key == "manageTeamsPopup")!.element.style.left = "";
      references.find(
        e => e.key === "manageTeamsPopup"
      )!.element.parentElement.parentElement.style.position = "fixed";
    }
    if (
      references.find(e => e.key == "manageServicePopup") &&
      references.find(e => e.key == "manageServicePopup")!.element
    ) {
      references.find(e => e.key == "manageServicePopup")!.element.style.zIndex = "";
      references.find(e => e.key === "manageServicePopup")!.element.style.boxShadow = "";
      references.find(e => e.key === "manageServicePopup")!.element.style.position = "";

      references.find(e => e.key == "manageServicePopup")!.element.style.top = "";
      references.find(e => e.key == "manageServicePopup")!.element.style.left = "";
      references.find(
        e => e.key === "manageServicePopup"
      )!.element.parentElement.parentElement.style.position = "fixed";
    }
    if (
      references.find(e => e.key == "manageServicesNext") &&
      references.find(e => e.key == "manageServicesNext")!.element
    ) {
      references
        .find(e => e.key === "manageServicesNext")!
        .element.removeEventListener("click", this.manageServicesNext);
    }

    closeTutorial(a);
  };

  contentrender(context) {
    console.log("INTRO", this.props);
    const { tutorialId, goToTutorial } = this.props;
    const references = context.references;
    switch (tutorialId) {
      case 1:
        if (
          references.find(e => e.key == "emanager") &&
          references.find(e => e.key == "emanager")!.element
        ) {
          references.find(e => e.key == "emanager")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "emanager")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "emanager")!.element.style.position = "relative";
          references
            .find(e => e.key === "emanager")!
            .element.addEventListener("click", this.sidebarClick);
        }
        return (
          <div id="overlay">
            <div
              className="tutorialPopupLeft"
              style={{
                top: references.find(e => e.key === "emanager")
                  ? this.calculateTop(references.find(e => e.key === "emanager")!.element, -10)
                  : "",
                left: references.find(e => e.key === "emanager")
                  ? this.calculateLeft(references.find(e => e.key === "emanager")!.element, 0, 2)
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tour.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">Click on EmployeeManager</div>
            </div>
          </div>
        );

      case 2:
        if (
          references.find(e => e.key == "emanager") &&
          references.find(e => e.key == "emanager")!.element
        ) {
          references.find(e => e.key == "emanager")!.element.style.zIndex = "";
          references.find(e => e.key === "emanager")!.element.style.boxShadow = "";
          references.find(e => e.key === "emanager")!.element.style.position = "";
          references
            .find(e => e.key === "emanager")!
            .element.removeEventListener("click", this.sidebarClick);
        }
        if (
          references.find(e => e.key == "addEmp") &&
          references.find(e => e.key == "addEmp")!.element
        ) {
          references.find(e => e.key == "addEmp")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "addEmp")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "addEmp")!.element.style.position = "relative";
          references
            .find(e => e.key === "addEmp")!
            .element.addEventListener("click", this.addEmpClick);
        }
        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelowRight"
              style={{
                top: references.find(e => e.key === "addEmp")
                  ? this.calculateTop(references.find(e => e.key === "addEmp")!.element, 30, 2)
                  : "",
                left: references.find(e => e.key === "addEmp")
                  ? this.calculateLeft(
                      references.find(e => e.key === "addEmp")!.element,
                      0,
                      2,
                      true
                    )
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tour.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">Click on Add Employee to add a new employee</div>
            </div>
          </div>
        );

      case 3:
        if (
          references.find(e => e.key == "addEmp") &&
          references.find(e => e.key == "addEmp")!.element
        ) {
          references.find(e => e.key == "addEmp")!.element.style.zIndex = "";
          references.find(e => e.key === "addEmp")!.element.style.boxShadow = "";
          references.find(e => e.key === "addEmp")!.element.style.position = "";
          references
            .find(e => e.key === "addEmp")!
            .element.removeEventListener("click", this.addEmpClick);
        }

        if (
          references.find(e => e.key == "addEmpPopup") &&
          references.find(e => e.key == "addEmpPopup")!.element
        ) {
          console.log("addEmpPopup-ELEMENT", references.find(e => e.key == "addEmpPopup"));
          references.find(e => e.key == "addEmpPopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "addEmpPopup")!.element.style.top = "0px";
          references.find(e => e.key == "addEmpPopup")!.element.style.left = "calc(50% - 120px)";
          references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "addEmpPopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "addEmpPopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "saved") &&
          references.find(e => e.key == "saved")!.element
        ) {
          console.log("saved-ELEMENT", references.find(e => e.key == "saved"));
          references
            .find(e => e.key === "saved")!
            .element.addEventListener("click", this.continueClick);
        }

        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelow"
              style={{
                top: references.find(e => e.key === "addEmpPopup")
                  ? this.calculateTop(references.find(e => e.key === "addEmpPopup")!.element, 30, 2)
                  : "",
                left: references.find(e => e.key === "addEmpPopup")
                  ? this.calculateLeft(
                      references.find(e => e.key === "addEmpPopup")!.element,
                      10,
                      0
                    )
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tutorial.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">
                Please add the needed information about the new employee and click on Continue when
                you are finished
              </div>
            </div>
          </div>
        );
      case 4:
        if (
          references.find(e => e.key == "addEmpPopup") &&
          references.find(e => e.key == "addEmpPopup")!.element
        ) {
          references.find(e => e.key == "addEmpPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "addEmpPopup")!.element.style.position = "";

          references.find(e => e.key == "addEmpPopup")!.element.style.top = "";
          references.find(e => e.key == "addEmpPopup")!.element.style.left = "";
          references.find(
            e => e.key === "addEmpPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }
        if (
          references.find(e => e.key == "saved") &&
          references.find(e => e.key == "saved")!.element
        ) {
          references
            .find(e => e.key === "saved")!
            .element.removeEventListener("click", this.continueClick);
        }

        //Adding new

        if (
          references.find(e => e.key == "manageTeamsPopup") &&
          references.find(e => e.key == "manageTeamsPopup")!.element
        ) {
          console.log(
            "manageTeamsPopup-ELEMENT",
            references.find(e => e.key == "manageTeamsPopup")
          );
          references.find(e => e.key == "manageTeamsPopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "manageTeamsPopup")!.element.style.top = "0px";
          references.find(e => e.key == "manageTeamsPopup")!.element.style.left =
            "calc(50% - 568px)";
          references.find(e => e.key === "manageTeamsPopup")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "manageTeamsPopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "manageTeamsPopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "manageServicesNext") &&
          references.find(e => e.key == "manageServicesNext")!.element
        ) {
          console.log(
            "manageServicesNext-ELEMENT",
            references.find(e => e.key == "manageServicesNext")
          );
          references
            .find(e => e.key === "manageServicesNext")!
            .element.addEventListener("click", this.manageServicesNext);
          /*context.addRenderAction({
            key: "manageServicesNext",
            listener: "click",
            action: this.manageServicesNext
          });*/
        }
        if (
          references.find(e => e.key == "close") &&
          references.find(e => e.key == "close")!.element
        ) {
          console.log("close-ELEMENT", references.find(e => e.key == "close"));
          references
            .find(e => e.key === "close")!
            .element.addEventListener("click", this.closeTutorial);
        }

        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelowRight"
              style={{
                top: references.find(e => e.key === "manageServicesNext")
                  ? this.calculateTop(
                      references.find(e => e.key === "manageServicesNext")!.element,
                      30,
                      2
                    )
                  : "",
                left: references.find(e => e.key === "manageServicesNext")
                  ? this.calculateLeft(
                      references.find(e => e.key === "manageServicesNext")!.element,
                      0,
                      2,
                      true
                    )
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tour.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">
                Should the new employee be a member of a team? Then create a new team directly here.
                If teams have already been created, you can add them to a team with a single click.
                <br />
                <br />
                Teams are designed as a group structure to have a quicker overview of services and
                employees.
                <br />
                <br />
                When you have added the employee to all required teams, click on "Manage Services"
                to store login data for the employee.
              </div>
            </div>
          </div>
        );

      case 5:
        if (
          references.find(e => e.key == "manageTeamsPopup") &&
          references.find(e => e.key == "manageTeamsPopup")!.element
        ) {
          references.find(e => e.key == "manageTeamsPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "manageTeamsPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "manageTeamsPopup")!.element.style.position = "";

          references.find(e => e.key == "manageTeamsPopup")!.element.style.top = "";
          references.find(e => e.key == "manageTeamsPopup")!.element.style.left = "";
          references.find(
            e => e.key === "manageTeamsPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }
        if (
          references.find(e => e.key == "manageServicesNext") &&
          references.find(e => e.key == "manageServicesNext")!.element
        ) {
          references
            .find(e => e.key === "manageServicesNext")!
            .element.removeEventListener("click", this.manageServicesNext);
        }
        if (
          references.find(e => e.key == "close") &&
          references.find(e => e.key == "close")!.element
        ) {
          console.log("close-ELEMENT", references.find(e => e.key == "close"));
          references
            .find(e => e.key === "close")!
            .element.removeEventListener("click", this.closeTutorial);
        }

        //Adding new

        if (
          references.find(e => e.key == "manageServicePopup") &&
          references.find(e => e.key == "manageServicePopup")!.element
        ) {
          console.log(
            "manageServicePopup-ELEMENT",
            references.find(e => e.key == "manageServicePopup")
          );
          references.find(e => e.key == "manageServicePopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "manageServicePopup")!.element.style.top = "0px";
          references.find(e => e.key == "manageServicePopup")!.element.style.left =
            "calc(50% - 568px)";
          references.find(e => e.key === "manageServicePopup")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "manageServicePopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "manageServicePopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "close2") &&
          references.find(e => e.key == "close2")!.element
        ) {
          console.log("close-ELEMENT", references.find(e => e.key == "close2"));
          references
            .find(e => e.key === "close2")!
            .element.addEventListener("click", this.closeTutorial);
        }
        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelowRight"
              style={{
                top: references.find(e => e.key === "close2")
                  ? this.calculateTop(references.find(e => e.key === "close2")!.element, 30, 2)
                  : "",
                left: references.find(e => e.key === "close2")
                  ? this.calculateLeft(
                      references.find(e => e.key === "close2")!.element,
                      0,
                      2,
                      true
                    )
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tour.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">
                Assign accounts to the employee. On the right side, click on a service that the
                employee is to receive and enter the login data for the employee's account with this
                service.
                <br />
                <br />
                Once you have assigned all the required services, close the window.
              </div>
            </div>
          </div>
        );
      case 6:
        if (
          references.find(e => e.key == "manageTeamsPopup") &&
          references.find(e => e.key == "manageTeamsPopup")!.element
        ) {
          references.find(e => e.key == "manageTeamsPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "manageTeamsPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "manageTeamsPopup")!.element.style.position = "";

          references.find(e => e.key == "manageTeamsPopup")!.element.style.top = "";
          references.find(e => e.key == "manageTeamsPopup")!.element.style.left = "";
          references.find(
            e => e.key === "manageTeamsPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }
        if (
          references.find(e => e.key == "manageServicePopup") &&
          references.find(e => e.key == "manageServicePopup")!.element
        ) {
          references.find(e => e.key == "manageServicePopup")!.element.style.zIndex = "";
          references.find(e => e.key === "manageServicePopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "manageServicePopup")!.element.style.position = "";

          references.find(e => e.key == "manageServicePopup")!.element.style.top = "";
          references.find(e => e.key == "manageServicePopup")!.element.style.left = "";
          references.find(
            e => e.key === "manageServicePopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }
        if (
          references.find(e => e.key == "manageServicesNext") &&
          references.find(e => e.key == "manageServicesNext")!.element
        ) {
          references
            .find(e => e.key === "manageServicesNext")!
            .element.removeEventListener("click", this.manageServicesNext);
        }
        if (
          references.find(e => e.key == "close") &&
          references.find(e => e.key == "close")!.element
        ) {
          console.log("close-ELEMENT", references.find(e => e.key == "close"));
          references
            .find(e => e.key === "close")!
            .element.removeEventListener("click", this.closeTutorial);
        }
        if (
          references.find(e => e.key == "close2") &&
          references.find(e => e.key == "close2")!.element
        ) {
          console.log("close-ELEMENT", references.find(e => e.key == "close2"));
          references
            .find(e => e.key === "close2")!
            .element.removeEventListener("click", this.closeTutorial);
        }
        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            The first employee has already been added. You can add it to other teams and/or services
            at any time using the Employeemanager.
            <br />
            <br />
            An overview of all teams can be found in the Team Manager.
            <br />
            All integrated services are listed in the service manager.
            <button onClick={() => this.close({ tutorial: "intro" })}>Explore VIPFY</button>
          </PopupBase>
        );
      default:
        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            We are very excited to welcome you to VIPFY. Let's get started right away!
            <button onClick={() => goToTutorial(1)}>
              Let's integrate the first employee into VIPFY together.
            </button>
            {/*<button>Let's merge the first login into VIPFY together</button>*/}
            <button onClick={() => this.close({ tutorial: "intro" })}>
              Or would you prefer to take a look around for yourself?
            </button>
          </PopupBase>
        );
    }
  }

  render() {
    console.log("INTRO 279", this.props.references);
    return (
      <AppContext.Consumer>
        {context => {
          console.log("CONTEXT", context, context.references);
          return this.contentrender(context);
        }}
      </AppContext.Consumer>
    );
  }
}

export default TutorialsIntro;
