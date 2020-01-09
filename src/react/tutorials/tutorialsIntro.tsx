import * as React from "react";
import PopupBase from "../popups/universalPopups/popupBase";
import { AppContext, sleep } from "../common/functions";
import pic1 from "../../images/Illustration_Tutorial003.png";
import pic2 from "../../images/Illustration_Tutorial002.png";
import pic3 from "../../images/Illustration_Tutorial001.png";
import UniversalButton from "../components/universalButtons/universalButton";

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
  errorEmp = () => this.props.goToTutorial(3);
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

  serviceManagerClick = () => this.props.goToTutorial(6);
  addServiceClick = () => this.props.goToTutorial(7);
  createOrbitClick = () => this.props.goToTutorial(8);
  continueSaveOrbit = () => this.props.goToTutorial(9);
  addAccountClick = () => this.props.goToTutorial(10);
  continuesaveAccount = () => this.props.goToTutorial(11);
  endTutorialClick = () => this.props.goToTutorial(12);
  closeTutorial = () => this.props.goToTutorial(-4);
  closeTutorialService = () => this.props.goToTutorial(-8);

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
      console.log(
        "close-ELEMENT",
        references.find(e => e.key == "close")
      );
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
    console.log("INTRO", this.props, context);
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
              <div className="tutorialContent">
                <p>First of all: Let's integrate another employee.</p>
                <p>To see and edit all employees of your company</p>
                <p style={{ fontWeight: "bold" }}>Click on EmployeeManager</p>
              </div>
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
              <div className="tutorialContent">
                <p>
                  First we have to add another employee to your company. As you can see - you are
                  already present in our company.
                </p>
                <p style={{ fontWeight: "bold" }}>Click on Add Employee to add a new employee</p>
              </div>
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
          references.find(e => e.key == "errorNext") &&
          references.find(e => e.key == "errorNext")!.element
        ) {
          references.find(e => e.key == "errorNext")!.element.style.zIndex = "";
          references.find(e => e.key === "errorNext")!.element.style.boxShadow = "";
          references.find(e => e.key === "errorNext")!.element.style.position = "";
          references
            .find(e => e.key === "errorNext")!
            .element.removeEventListener("click", this.errorEmp);
        }

        if (
          references.find(e => e.key == "addEmpPopup") &&
          references.find(e => e.key == "addEmpPopup")!.element
        ) {
          console.log(
            "addEmpPopup-ELEMENT",
            references.find(e => e.key == "addEmpPopup")
          );
          references.find(e => e.key == "addEmpPopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "addEmpPopup")!.element.style.top = "0px";
          references.find(e => e.key == "addEmpPopup")!.element.style.left = "calc(50% - 120px)";
          /*references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow =
            "0px 0px 15px 0px white";*/
          references.find(e => e.key === "addEmpPopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "addEmpPopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "saved") &&
          references.find(e => e.key == "saved")!.element
        ) {
          console.log(
            "saved-ELEMENT",
            references.find(e => e.key == "saved")
          );
          references
            .find(e => e.key === "saved")!
            .element.addEventListener("click", this.continueClick);
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.addEventListener("click", this.closeTutorial);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.addEventListener("click", this.closeTutorial);
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
                <p>Insert the needed information about the new employee</p>
                <p style={{ fontWeight: "bold" }}>click on Continue when you are finished</p>
              </div>
            </div>
          </div>
        );
      case 4:
        if (
          references.find(e => e.key == "errorNext") &&
          references.find(e => e.key == "errorNext")!.element
        ) {
          references.find(e => e.key == "errorNext")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "errorNext")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "errorNext")!.element.style.position = "relative";
          references
            .find(e => e.key === "errorNext")!
            .element.addEventListener("click", this.errorEmp);
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
        if (
          references.find(e => e.key == "saved") &&
          references.find(e => e.key == "saved")!.element
        ) {
          references
            .find(e => e.key === "saved")!
            .element.removeEventListener("click", this.continueClick);
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.removeEventListener("click", this.closeTutorial);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.removeEventListener("click", this.closeTutorial);
        }

        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            <div style={{ marginTop: "64px", display: "flex", justifyContent: "center" }}>
              <img src={pic2} style={{ width: "50%" }} />
            </div>
            <div style={{ marginTop: "32px", textAlign: "center", marginBottom: "40px" }}>
              Perfect. Next step: Integrate your first credentials so you can access services from
              VIPFY.
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {/*<button>Let's merge the first login into VIPFY together</button>*/}
              <UniversalButton
                type="low"
                onClick={() => this.close({ tutorial: "intro" })}
                label="End Tour"
              />
              <UniversalButton type="low" onClick={() => goToTutorial(5)} label="Continue Tour" />
            </div>
          </PopupBase>
        );

      case -4:
        //Canceled User Creation

        if (
          references.find(e => e.key == "errorNext") &&
          references.find(e => e.key == "errorNext")!.element
        ) {
          references.find(e => e.key == "errorNext")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "errorNext")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "errorNext")!.element.style.position = "relative";
          references
            .find(e => e.key === "errorNext")!
            .element.addEventListener("click", this.errorEmp);
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
        if (
          references.find(e => e.key == "saved") &&
          references.find(e => e.key == "saved")!.element
        ) {
          references
            .find(e => e.key === "saved")!
            .element.removeEventListener("click", this.continueClick);
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.removeEventListener("click", this.closeTutorial);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.removeEventListener("click", this.closeTutorial);
        }

        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            <div style={{ marginTop: "64px", display: "flex", justifyContent: "center" }}>
              <img src={pic2} style={{ width: "50%" }} />
            </div>
            <div style={{ marginTop: "32px", textAlign: "center", marginBottom: "40px" }}>
              No problem. Although you have cancelled the creation of a new employee, you can of
              course do so at any time. Shall we show you how to integrate your first credentials
              into VIPFY?
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {/*<button>Let's merge the first login into VIPFY together</button>*/}
              <UniversalButton
                type="low"
                onClick={() => this.close({ tutorial: "intro" })}
                label="End Tour"
              />
              <UniversalButton type="low" onClick={() => goToTutorial(5)} label="Continue Tour" />
            </div>
          </PopupBase>
        );

      case 5:
        if (
          references.find(e => e.key == "lmanager") &&
          references.find(e => e.key == "lmanager")!.element
        ) {
          references.find(e => e.key == "lmanager")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "lmanager")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "lmanager")!.element.style.position = "relative";
          references
            .find(e => e.key === "lmanager")!
            .element.addEventListener("click", this.serviceManagerClick);
        }
        return (
          <div id="overlay">
            <div
              className="tutorialPopupLeft"
              style={{
                top: references.find(e => e.key === "lmanager")
                  ? this.calculateTop(references.find(e => e.key === "lmanager")!.element, -10)
                  : "",
                left: references.find(e => e.key === "lmanager")
                  ? this.calculateLeft(references.find(e => e.key === "lmanager")!.element, 0, 2)
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tour.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">
                <p>To see and edit all services and credentials of your company</p>
                <p style={{ fontWeight: "bold" }}>Click on ServiceManager</p>
              </div>
            </div>
          </div>
        );
      case 6:
        if (
          references.find(e => e.key == "lmanager") &&
          references.find(e => e.key == "lmanager")!.element
        ) {
          references.find(e => e.key == "lmanager")!.element.style.zIndex = "";
          references.find(e => e.key === "lmanager")!.element.style.boxShadow = "";
          references.find(e => e.key === "lmanager")!.element.style.position = "";
          references
            .find(e => e.key === "lmanager")!
            .element.removeEventListener("click", this.sidebarClick);
        }
        if (
          references.find(e => e.key == "addService") &&
          references.find(e => e.key == "addService")!.element
        ) {
          references.find(e => e.key == "addService")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "addService")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "addService")!.element.style.position = "relative";
          references
            .find(e => e.key === "addService")!
            .element.addEventListener("click", this.addServiceClick);
        }
        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelowRight"
              style={{
                top: references.find(e => e.key === "addService")
                  ? this.calculateTop(references.find(e => e.key === "addService")!.element, 30, 2)
                  : "",
                left: references.find(e => e.key === "addService")
                  ? this.calculateLeft(
                      references.find(e => e.key === "addService")!.element,
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
                <p>First we have to select a service.</p>
                <p style={{ fontWeight: "bold" }}>Click on Add Serivce to add a new service</p>
              </div>
            </div>
          </div>
        );

      case 7:
        if (
          references.find(e => e.key == "createOrbit") &&
          references.find(e => e.key == "createOrbit")!.element
        ) {
          if (
            references.find(e => e.key == "addServicePopup") &&
            references.find(e => e.key == "addServicePopup")!.element
          ) {
            references.find(e => e.key == "addServicePopup")!.element.style.zIndex = "";
            references.find(e => e.key === "addServicePopup")!.element.style.boxShadow = "";
            references.find(e => e.key === "addServicePopup")!.element.style.position = "";

            references.find(e => e.key == "addServicePopup")!.element.style.top = "";
            references.find(e => e.key == "addServicePopup")!.element.style.left = "";
            references.find(
              e => e.key === "addServicePopup"
            )!.element.parentElement.parentElement.style.position = "fixed";
          }

          if (
            references.find(e => e.key == "closePopup") &&
            references.find(e => e.key == "closePopup")!.element
          ) {
            references
              .find(e => e.key === "closePopup")!
              .element.removeEventListener("click", this.closeTutorialService);
          }

          if (
            references.find(e => e.key == "cancel") &&
            references.find(e => e.key == "cancel")!.element
          ) {
            references
              .find(e => e.key === "cancel")!
              .element.removeEventListener("click", this.closeTutorialService);
          }

          references.find(e => e.key == "createOrbit")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "createOrbit")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "createOrbit")!.element.style.position = "relative";
          references
            .find(e => e.key === "createOrbit")!
            .element.addEventListener("click", this.createOrbitClick);

          return (
            <div id="overlay">
              <div
                className="tutorialPopupBelow"
                style={{
                  top: references.find(e => e.key === "createOrbit")
                    ? this.calculateTop(
                        references.find(e => e.key === "createOrbit")!.element,
                        30,
                        2
                      )
                    : "",
                  left: references.find(e => e.key === "createOrbit")
                    ? this.calculateLeft(
                        references.find(e => e.key === "createOrbit")!.element,
                        10,
                        0
                      )
                    : ""
                }}>
                <div
                  className="tutorialCloseInfo"
                  onClick={() => this.close({ tutorial: "intro" })}>
                  <i className="fas fa-times" /> Close this tutorial.
                  <br />
                  You will find more information in our Forum
                </div>
                <div className="tutorialContent">
                  <p>Click here to create your first orbit.</p>
                  <p>
                    An orbit is the representation of the instances at an external provider.
                    Sometimes it is necessary to run several independent instances of a service.
                    These instances can be represented by orbits. Orbits typically have different
                    subdomains, if the service uses subdomains at all.
                  </p>
                </div>
              </div>
            </div>
          );
        } else {
          if (
            references.find(e => e.key == "addService") &&
            references.find(e => e.key == "addService")!.element
          ) {
            references.find(e => e.key == "addService")!.element.style.zIndex = "";
            references.find(e => e.key === "addService")!.element.style.boxShadow = "";
            references.find(e => e.key === "addService")!.element.style.position = "";
            references
              .find(e => e.key === "addService")!
              .element.removeEventListener("click", this.addServiceClick);
          }

          if (
            references.find(e => e.key == "addServicePopup") &&
            references.find(e => e.key == "addServicePopup")!.element
          ) {
            console.log(
              "addServicePopup-ELEMENT",
              references.find(e => e.key == "addServicePopup")
            );
            references.find(e => e.key == "addServicePopup")!.element.style.zIndex = "3000000";
            references.find(e => e.key == "addServicePopup")!.element.style.top = "0px";
            references.find(e => e.key == "addServicePopup")!.element.style.left =
              "calc(50% - 120px)";
            /*references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow =
                "0px 0px 15px 0px white";*/
            references.find(e => e.key === "addServicePopup")!.element.style.position = "fixed";
            references.find(
              e => e.key === "addServicePopup"
            )!.element.parentElement.parentElement.style.position = "initial";
          }

          if (
            references.find(e => e.key == "closePopup") &&
            references.find(e => e.key == "closePopup")!.element
          ) {
            references
              .find(e => e.key === "closePopup")!
              .element.addEventListener("click", this.closeTutorialService);
          }

          if (
            references.find(e => e.key == "cancel") &&
            references.find(e => e.key == "cancel")!.element
          ) {
            references
              .find(e => e.key === "cancel")!
              .element.addEventListener("click", this.closeTutorialService);
          }

          return (
            <div id="overlay">
              <div
                className="tutorialPopupBelow"
                style={{
                  top: references.find(e => e.key === "addServicePopup")
                    ? this.calculateTop(
                        references.find(e => e.key === "addServicePopup")!.element,
                        80,
                        2
                      )
                    : "",
                  left: references.find(e => e.key === "addServicePopup")
                    ? this.calculateLeft(
                        references.find(e => e.key === "addServicePopup")!.element,
                        10,
                        0
                      )
                    : ""
                }}>
                <div
                  className="tutorialCloseInfo"
                  onClick={() => this.close({ tutorial: "intro" })}>
                  <i className="fas fa-times" /> Close this tutorial.
                  <br />
                  You will find more information in our Forum
                </div>
                <div className="tutorialContent">
                  <p>
                    Select the service you want to add. Either type it first and select it in the
                    dropdown or click on <span style={{ fontWeight: "bold" }}>SHOW ALL</span> to see
                    all services that are nativly supported by VIPFY
                  </p>
                </div>
              </div>
            </div>
          );
        }

      case 8:
        if (
          references.find(e => e.key == "createOrbit") &&
          references.find(e => e.key == "createOrbit")!.element
        ) {
          references.find(e => e.key == "createOrbit")!.element.style.zIndex = "";
          references.find(e => e.key === "createOrbit")!.element.style.boxShadow = "";
          references.find(e => e.key === "createOrbit")!.element.style.position = "";
          references
            .find(e => e.key === "createOrbit")!
            .element.removeEventListener("click", this.sidebarClick);
        }

        if (
          references.find(e => e.key == "createOrbitPopup") &&
          references.find(e => e.key == "createOrbitPopup")!.element
        ) {
          console.log(
            "createOrbitPopup-ELEMENT",
            references.find(e => e.key == "createOrbitPopup")
          );
          references.find(e => e.key == "createOrbitPopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "createOrbitPopup")!.element.style.top = "0px";
          references.find(e => e.key == "createOrbitPopup")!.element.style.left =
            "calc(50% - 120px)";
          /*references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow =
                  "0px 0px 15px 0px white";*/
          references.find(e => e.key === "createOrbitPopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "createOrbitPopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.addEventListener("click", this.closeTutorialService);
        }
        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.addEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "saveOrbit") &&
          references.find(e => e.key == "saveOrbit")!.element
        ) {
          references
            .find(e => e.key === "saveOrbit")!
            .element.addEventListener("click", this.continueSaveOrbit);
        }

        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelow"
              style={{
                top: references.find(e => e.key === "createOrbitPopup")
                  ? this.calculateTop(
                      references.find(e => e.key === "createOrbitPopup")!.element,
                      30,
                      2
                    )
                  : "",
                left: references.find(e => e.key === "createOrbitPopup")
                  ? this.calculateLeft(
                      references.find(e => e.key === "createOrbitPopup")!.element,
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
                <p>
                  Please enter an alias for the orbit. Also specify the subdomain of your service
                  instance if you are required to do so.
                </p>
                <p style={{ fontWeight: "bold" }}>Than click on save</p>
              </div>
            </div>
          </div>
        );

      case -8:
        if (
          references.find(e => e.key == "addServicePopup") &&
          references.find(e => e.key == "addServicePopup")!.element
        ) {
          references.find(e => e.key == "addServicePopup")!.element.style.zIndex = "";
          references.find(e => e.key === "addServicePopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "addServicePopup")!.element.style.position = "";

          references.find(e => e.key == "addServicePopup")!.element.style.top = "";
          references.find(e => e.key == "addServicePopup")!.element.style.left = "";
          references.find(
            e => e.key === "addServicePopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }

        if (
          references.find(e => e.key == "createOrbitPopup") &&
          references.find(e => e.key == "createOrbitPopup")!.element
        ) {
          references.find(e => e.key == "createOrbitPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "createOrbitPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "createOrbitPopup")!.element.style.position = "";

          references.find(e => e.key == "createOrbitPopup")!.element.style.top = "";
          references.find(e => e.key == "createOrbitPopup")!.element.style.left = "";
          references.find(
            e => e.key === "createOrbitPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            <div style={{ marginTop: "64px", display: "flex", justifyContent: "center" }}>
              <img src={pic2} style={{ width: "50%" }} />
            </div>
            <div style={{ marginTop: "32px", textAlign: "center", marginBottom: "40px" }}>
              No problem. Whenever you have a question, just check our forum. We will gladly answer
              your questions. If you have any suggestions for improvement, please let us know.
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <UniversalButton
                type="low"
                onClick={() => this.close({ tutorial: "intro" })}
                label="Start using VIPFY"
              />
            </div>
          </PopupBase>
        );

      case 9:
        if (
          references.find(e => e.key == "createOrbitPopup") &&
          references.find(e => e.key == "createOrbitPopup")!.element
        ) {
          references.find(e => e.key == "createOrbitPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "createOrbitPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "createOrbitPopup")!.element.style.position = "";

          references.find(e => e.key == "createOrbitPopup")!.element.style.top = "";
          references.find(e => e.key == "createOrbitPopup")!.element.style.left = "";
          references.find(
            e => e.key === "createOrbitPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "addAccount") &&
          references.find(e => e.key == "addAccount")!.element
        ) {
          references.find(e => e.key == "addAccount")!.element.style.zIndex = "3000000";
          references.find(e => e.key === "addAccount")!.element.style.boxShadow =
            "0px 0px 15px 0px white";
          references.find(e => e.key === "addAccount")!.element.style.position = "relative";
          references
            .find(e => e.key === "addAccount")!
            .element.addEventListener("click", this.addAccountClick);
        }

        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelow"
              style={{
                top: references.find(e => e.key === "addAccount")
                  ? this.calculateTop(references.find(e => e.key === "addAccount")!.element, 30, 2)
                  : "",
                left: references.find(e => e.key === "addAccount")
                  ? this.calculateLeft(references.find(e => e.key === "addAccount")!.element, 10, 0)
                  : ""
              }}>
              <div className="tutorialCloseInfo" onClick={() => this.close({ tutorial: "intro" })}>
                <i className="fas fa-times" /> Close this tutorial.
                <br />
                You will find more information in our Forum
              </div>
              <div className="tutorialContent">
                <p>Click here to add your first account.</p>
              </div>
            </div>
          </div>
        );

      case 10:
        if (
          references.find(e => e.key == "addAccount") &&
          references.find(e => e.key == "addAccount")!.element
        ) {
          references.find(e => e.key == "addAccount")!.element.style.zIndex = "";
          references.find(e => e.key === "addAccount")!.element.style.boxShadow = "";
          references.find(e => e.key === "addAccount")!.element.style.position = "";
          references
            .find(e => e.key === "addAccount")!
            .element.removeEventListener("click", this.addAccountClick);
        }

        if (
          references.find(e => e.key == "saveAccountPopup") &&
          references.find(e => e.key == "saveAccountPopup")!.element
        ) {
          console.log(
            "saveAccountPopup-ELEMENT",
            references.find(e => e.key == "saveAccountPopup")
          );
          references.find(e => e.key == "saveAccountPopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "saveAccountPopup")!.element.style.top = "0px";
          references.find(e => e.key == "saveAccountPopup")!.element.style.left =
            "calc(50% - 120px)";
          /*references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow =
                  "0px 0px 15px 0px white";*/
          references.find(e => e.key === "saveAccountPopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "saveAccountPopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.addEventListener("click", this.closeTutorialService);
        }
        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.addEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "saveAccount") &&
          references.find(e => e.key == "saveAccount")!.element
        ) {
          references
            .find(e => e.key === "saveAccount")!
            .element.addEventListener("click", this.continuesaveAccount);
        }

        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelow"
              style={{
                top: references.find(e => e.key === "saveAccountPopup")
                  ? this.calculateTop(
                      references.find(e => e.key === "saveAccountPopup")!.element,
                      30,
                      2
                    )
                  : "",
                left: references.find(e => e.key === "saveAccountPopup")
                  ? this.calculateLeft(
                      references.find(e => e.key === "saveAccountPopup")!.element,
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
                <p>
                  Please enter your credentials. You can also choose how long these credentials
                  (account) are valid for.
                </p>
                <p style={{ fontWeight: "bold" }}>Than click on Create</p>
              </div>
            </div>
          </div>
        );

      case 11:
        if (
          references.find(e => e.key == "saveAccountPopup") &&
          references.find(e => e.key == "saveAccountPopup")!.element
        ) {
          references.find(e => e.key == "saveAccountPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "saveAccountPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "saveAccountPopup")!.element.style.position = "";

          references.find(e => e.key == "saveAccountPopup")!.element.style.top = "";
          references.find(e => e.key == "saveAccountPopup")!.element.style.left = "";
          references.find(
            e => e.key === "saveAccountPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "saveAccount") &&
          references.find(e => e.key == "saveAccount")!.element
        ) {
          references
            .find(e => e.key === "saveAccount")!
            .element.removeEventListener("click", this.continuesaveAccount);
        }

        //new stuff

        if (
          references.find(e => e.key == "assignPopup") &&
          references.find(e => e.key == "assignPopup")!.element
        ) {
          console.log(
            "assignPopup-ELEMENT",
            references.find(e => e.key == "assignPopup")
          );
          references.find(e => e.key == "assignPopup")!.element.style.zIndex = "3000000";
          references.find(e => e.key == "assignPopup")!.element.style.top = "0px";
          references.find(e => e.key == "assignPopup")!.element.style.left = "calc(50% - 120px)";
          /*references.find(e => e.key === "addEmpPopup")!.element.style.boxShadow =
                    "0px 0px 15px 0px white";*/
          references.find(e => e.key === "assignPopup")!.element.style.position = "fixed";
          references.find(
            e => e.key === "assignPopup"
          )!.element.parentElement.parentElement.style.position = "initial";
        }
        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.addEventListener("click", this.closeTutorialService);
        }
        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.addEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "saveAssign") &&
          references.find(e => e.key == "saveAssign")!.element
        ) {
          references
            .find(e => e.key === "saveAssign")!
            .element.addEventListener("click", this.endTutorialClick);
        }

        return (
          <div id="overlay">
            <div
              className="tutorialPopupBelow"
              style={{
                top: references.find(e => e.key === "assignPopup")
                  ? this.calculateTop(references.find(e => e.key === "assignPopup")!.element, 80, 2)
                  : "",
                left: references.find(e => e.key === "assignPopup")
                  ? this.calculateLeft(
                      references.find(e => e.key === "assignPopup")!.element,
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
                <p>
                  Assign this account to an employee. Simply start typing the name or click on show
                  all to select an employee.
                </p>
                <p>
                  You can also assign an account to multiple users but be sure that is allowed by
                  the service provider.
                </p>
                <p style={{ fontWeight: "bold" }}>When you are done, click on close</p>
              </div>
            </div>
          </div>
        );

      case 12:
        if (
          references.find(e => e.key == "assignPopup") &&
          references.find(e => e.key == "assignPopup")!.element
        ) {
          references.find(e => e.key == "assignPopup")!.element.style.zIndex = "";
          references.find(e => e.key === "assignPopup")!.element.style.boxShadow = "";
          references.find(e => e.key === "assignPopup")!.element.style.position = "";

          references.find(e => e.key == "assignPopup")!.element.style.top = "";
          references.find(e => e.key == "assignPopup")!.element.style.left = "";
          references.find(
            e => e.key === "assignPopup"
          )!.element.parentElement.parentElement.style.position = "fixed";
        }

        if (
          references.find(e => e.key == "closePopup") &&
          references.find(e => e.key == "closePopup")!.element
        ) {
          references
            .find(e => e.key === "closePopup")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "cancel") &&
          references.find(e => e.key == "cancel")!.element
        ) {
          references
            .find(e => e.key === "cancel")!
            .element.removeEventListener("click", this.closeTutorialService);
        }

        if (
          references.find(e => e.key == "saveAssign") &&
          references.find(e => e.key == "saveAssign")!.element
        ) {
          references
            .find(e => e.key === "saveAssign")!
            .element.removeEventListener("click", this.endTutorialClick);
        }

        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            <div style={{ marginTop: "64px", display: "flex", justifyContent: "center" }}>
              <img src={pic3} style={{ width: "50%" }} />
            </div>
            <div style={{ marginTop: "32px", textAlign: "center", marginBottom: "40px" }}>
              That's it. You have successfully integrated your first account. Whenever you have a
              question, just check our forum. We will gladly answer your questions. If you have any
              suggestions for improvement, please let us know.
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <UniversalButton
                type="low"
                onClick={() => this.close({ tutorial: "intro" })}
                label="Continue using VIPFY"
              />
            </div>
          </PopupBase>
        );

      //Adding new

      /*if (
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
          /&*context.addRenderAction({
            key: "manageServicesNext",
            listener: "click",
            action: this.manageServicesNext
          });*&/
        }
        if (
          references.find(e => e.key == "close") &&
          references.find(e => e.key == "close")!.element
        ) {
          console.log(
            "close-ELEMENT",
            references.find(e => e.key == "close")
          );
          references
            .find(e => e.key === "close")!
            .element.addEventListener("click", this.closeTutorial);
        }

        if (
          references.find(e => e.key == "errorNext") &&
          references.find(e => e.key == "errorNext")!.element
        ) {
          return "";
        } else {
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
                <div
                  className="tutorialCloseInfo"
                  onClick={() => this.close({ tutorial: "intro" })}>
                  <i className="fas fa-times" /> Close this tour.
                  <br />
                  You will find more information in our Forum
                </div>
                <div className="tutorialContent">
                  Should the new employee be a member of a team? Then create a new team directly
                  here. If teams have already been created, you can add them to a team with a single
                  click.
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
        }*/

      /*case 5:
        if (
          references.find(e => e.key == "errorNext") &&
          references.find(e => e.key == "errorNext")!.element
        ) {
          references.find(e => e.key == "errorNext")!.element.style.zIndex = "";
          references.find(e => e.key === "errorNext")!.element.style.boxShadow = "";
          references.find(e => e.key === "errorNext")!.element.style.position = "";
          references
            .find(e => e.key === "errorNext")!
            .element.removeEventListener("click", this.errorEmp);
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
        if (
          references.find(e => e.key == "close") &&
          references.find(e => e.key == "close")!.element
        ) {
          console.log(
            "close-ELEMENT",
            references.find(e => e.key == "close")
          );
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
          console.log(
            "close-ELEMENT",
            references.find(e => e.key == "close2")
          );
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
          console.log(
            "close-ELEMENT",
            references.find(e => e.key == "close")
          );
          references
            .find(e => e.key === "close")!
            .element.removeEventListener("click", this.closeTutorial);
        }
        if (
          references.find(e => e.key == "close2") &&
          references.find(e => e.key == "close2")!.element
        ) {
          console.log(
            "close-ELEMENT",
            references.find(e => e.key == "close2")
          );
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
        );*/
      default:
        return (
          <PopupBase close={async () => this.close({ tutorial: "intro" })} nooutsideclose={true}>
            <div style={{ marginTop: "64px", display: "flex", justifyContent: "center" }}>
              <img src={pic1} style={{ width: "50%" }} />
            </div>
            <div style={{ marginTop: "32px", textAlign: "center", marginBottom: "40px" }}>
              We are very excited to welcome you to VIPFY. Let's get started right away!
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {/*<button>Let's merge the first login into VIPFY together</button>*/}
              <UniversalButton
                type="low"
                onClick={() => this.close({ tutorial: "intro" })}
                label="Skip Tour"
              />
              <UniversalButton
                type="low"
                onClick={() => goToTutorial(1)}
                label="First steps with VIPFY"
              />
            </div>
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