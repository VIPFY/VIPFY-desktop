import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import PopupSelfSaving from "./selfSaving";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import { concatName } from "../../common/functions";

interface Props {
  key: string;
  heading: string;
  subHeading?: string | JSX.Element;
  services: any[];
  employees: any[];
  main?: any;
  close: Function;
  nooutsideclose?: boolean;
  submit: Function;
  submitDisabled?: Function;
  savingHeading?: string;
  explainImage?: JSX.Element;
  cancelLabel?: string;
  confirmLabel?: string;
  addStyles?: Object;
}

interface State {
  values: object[];
  save: Boolean;
}

class DeletePopup extends React.Component<Props, State> {
  state = { values: [], save: false };

  componentWillUnmount() {
    this.setState({ save: false });
  }

  printRemove(mainArray, subArray) {
    let RLicencesArray: JSX.Element[] = [];
    mainArray.forEach((mainitem, mainint) => {
      RLicencesArray.push(
        <li className="heading" key={`m-${mainint}`}>
          <UniversalCheckbox
            name={`m-${mainitem.id}`}
            startingvalue={
              !this.state.values[`m-${mainitem.id}`]
                ? true
                : subArray.every(l => this.state.values[`m-${mainitem.id}`].find(s => s == l.id))
                ? false
                : "2"
            }
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const valuesNEW = prevState.values;
                    if (prevState.values[`m-${mainitem.id}`]) {
                      delete valuesNEW[`m-${mainitem.id}`];
                    }

                    return {
                      values: valuesNEW
                    };
                  })
                : this.setState(prevState => {
                    const valuesNEW = prevState.values;
                    valuesNEW[`m-${mainitem.id}`] = subArray.map(s => s.id);

                    return {
                      values: valuesNEW
                    };
                  })
            }>
            <span>
              Remove{" "}
              {!this.state.values[`m-${mainitem.id}`]
                ? "all"
                : subArray.every(l => this.state.values[`m-${mainitem.id}`].find(s => s == l.id))
                ? "no"
                : "some"}{" "}
              from {mainitem.planid ? mainitem.planid.appid.name : concatName(mainitem)}
            </span>
          </UniversalCheckbox>
        </li>
      );
      subArray.forEach((item, int) => {
        RLicencesArray.push(
          <li key={int} style={{ marginLeft: "32px" }}>
            <UniversalCheckbox
              name={`${mainitem.id}-${item.id}`}
              startingvalue={
                !(
                  this.state.values[`m-${mainitem.id}`] &&
                  this.state.values[`m-${mainitem.id}`].findIndex(l => l == item.id) >= 0
                )
              }
              liveValue={v =>
                v
                  ? this.setState(prevState => {
                      const valuesNEW = prevState.values;
                      valuesNEW[`m-${mainitem.id}`].splice(
                        prevState.values[`m-${mainitem.id}`].findIndex(l => l == item.id),
                        1
                      );

                      if (valuesNEW[`m-${mainitem.id}`].length == 0) {
                        delete valuesNEW[`m-${mainitem.id}`];
                      }

                      return {
                        values: valuesNEW
                      };
                    })
                  : this.setState(prevState => {
                      const valuesNEW = prevState.values;
                      if (valuesNEW[`m-${mainitem.id}`]) {
                        valuesNEW[`m-${mainitem.id}`].push(item.id);
                      } else {
                        valuesNEW[`m-${mainitem.id}`] = [item.id];
                      }

                      return {
                        values: valuesNEW
                      };
                    })
              }>
              <span>{item.planid ? item.planid.appid.name : concatName(item)}</span>
            </UniversalCheckbox>
          </li>
        );
      });
    });
    return RLicencesArray != [] ? <ul className="removeList">{RLicencesArray}</ul> : "";
  }

  render() {
    const {
      heading,
      subHeading,
      services,
      employees,
      main,
      close,
      nooutsideclose,
      submit,
      key,
      submitDisabled,
      savingHeading,
      explainImage,
      cancelLabel,
      confirmLabel,
      addStyles
    } = this.props;

    return (
      <PopupBase
        nooutsideclose={nooutsideclose}
        small={true}
        close={close}
        additionalclassName="formPopup deletePopup"
        styles={addStyles}>
        <h1>{heading}</h1>
        <div className="deleteContent">
          {subHeading && <h2>{subHeading}</h2>}
          {explainImage && (
            <div style={{ marginBottom: "36px", display: "flex", justifyContent: "center" }}>
              {explainImage}
            </div>
          )}
          {main == "employee"
            ? this.printRemove(employees, services)
            : this.printRemove(services, employees)}
          <div className="buttonsPopup">
            <UniversalButton
              type="low"
              onClick={() => {
                this.setState({ values: [] });
                close();
              }}
              label={cancelLabel || "Cancel"}
            />
            <UniversalButton
              type="high"
              disabled={submitDisabled && submitDisabled(this.state.values)}
              label={confirmLabel || "Confirm"}
              onClick={() => this.setState({ save: true })}
            />
            {this.state.save && (
              <PopupSelfSaving
                saveFunction={async () => await submit(this.state.values)}
                heading={savingHeading || "Process Data"}
                closeFunction={() => close()}
              />
            )}
          </div>
        </div>
      </PopupBase>
    );
  }
}
export default DeletePopup;
