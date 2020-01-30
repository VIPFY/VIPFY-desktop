import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import PrintEmployeeSquare from "../squares/printEmployeeSquare";
import UniversalDropDownInput from "../../../../components/universalForms/universalDropdownInput";
import { concatName } from "../../../../common/functions";
import PrintServiceSquare from "../squares/printServiceSquare";
import UniversalButton from "../../../../components/universalButtons/universalButton";
import { Query } from "react-apollo";
import { fetchApps } from "../../../../queries/products";
import PopupSSO from "../../../../popups/universalPopups/PopupSSO";
import SelfSavingIllustrated from "../../../../popups/universalPopups/SelfSavingIllustrated";
import { BrowserView } from "electron";

interface Props {
  continue: Function;
}

interface State {
  service: number;
  showall: Boolean;
  ownSSO: any;
  popupSSO: Boolean;
  showLoading: Boolean;
  appname: String;
}

class AssignServiceToUser extends React.Component<Props, State> {
  state = {
    service: 0,
    showall: false,
    ownSSO: null,
    popupSSO: false,
    showLoading: false,
    appname: ""
  };

  render() {
    return (
      <Query query={fetchApps}>
        {({ loading, error, data }) => {
          if (loading) {
            return "Loading...";
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          let apps = data.allApps;

          apps.sort(function(a, b) {
            let nameA = a.name.toUpperCase(); // ignore upper and lowercase
            let nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // namen müssen gleich sein
            return 0;
          });
          return (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px"
                }}>
                <span style={{ marginBottom: "2px" }}>Service:</span>

                <UniversalDropDownInput
                  id="service-search"
                  label="Search for service"
                  options={apps}
                  noFloating={true}
                  resetPossible={true}
                  width="300px"
                  codeFunction={app => app.id}
                  renderOption={(possibleValues, i, click, value) => (
                    <div
                      key={`searchResult-${i}`}
                      className="searchResult"
                      onClick={() => click(possibleValues[i])}>
                      <PrintServiceSquare service={possibleValues[i]} appidFunction={app => app} />
                      <span className="resultHighlight">
                        {possibleValues[i].name.substring(0, value.length)}
                      </span>
                      <span>{possibleValues[i].name.substring(value.length)}</span>
                    </div>
                  )}
                  alternativeText={inputelement => (
                    <span
                      className="inputInsideButton"
                      style={{
                        width: "auto",
                        backgroundColor: "transparent",
                        cursor: "text"
                      }}>
                      <span
                        onClick={() => inputelement.focus()}
                        style={{ marginRight: "4px", fontSize: "12px" }}>
                        Start typing or
                      </span>
                      <UniversalButton
                        type="low"
                        tabIndex={-1}
                        onClick={() => {
                          this.setState({ showall: true });
                        }}
                        label="show all"
                        customStyles={{ lineHeight: "24px" }}
                      />
                    </span>
                  )}
                  showIcon={app => (
                    <PrintServiceSquare
                      service={app}
                      appidFunction={app => app}
                      size={24}
                      additionalStyles={{
                        lineHeight: "24px",
                        width: "24px",
                        height: "24px",
                        fontSize: "13px",
                        marginTop: "0px",
                        marginLeft: "0px",
                        position: "absolute",
                        top: "4px"
                      }}
                    />
                  )}
                  startvalue={this.state.service ? this.state.service + "" : ""}
                  livecode={c => this.props.continue(apps.find(a => a.id == c))}
                  noresults="Integrate as new service"
                  noresultsClick={v => this.setState({ popupSSO: true, appname: v })}
                  fewResults={true}
                />
              </div>
              {/*<h2>Unsure what you need?</h2>
                          <div>TEST TEST</div>*/}
              {this.state.showall && (
                <PopupBase
                  nooutsideclose={true}
                  close={() => this.setState({ showall: false })}
                  buttonStyles={{ justifyContent: "space-between" }}>
                  <h1>All Services</h1>
                  <div className="addgrid-holder" style={{ maxHeight: "50vh" }}>
                    <div className="addgrid">
                      {apps.map(app => (
                        <div
                          key={app.id}
                          className="space"
                          onClick={() => {
                            this.setState({ showall: false });
                            this.props.continue(apps.find(a => a.id == app.id));
                          }}>
                          <PrintServiceSquare
                            service={app}
                            appidFunction={s => s}
                            className="image"
                            size={88}
                          />
                          <div className="name" title={app.name}>
                            {app.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <UniversalButton type="low" label="Cancel" closingPopup={true} />
                </PopupBase>
              )}
              {this.state.popupSSO && (
                <React.Fragment>
                  <PopupSSO
                    appname={this.state.appname}
                    cancel={() => this.setState({ popupSSO: false })}
                    add={values => {
                      if (values.logo) {
                        values.images = [values.logo, values.logo];
                      }
                      delete values.logo;

                      this.setState({ ownSSO: { ...values }, showLoading: true });
                    }}
                  />

                  {this.state.showLoading && (
                    <SelfSavingIllustrated
                      sso={this.state.ownSSO}
                      closeFunction={data => {
                        this.setState({ showLoading: false, popupSSO: false });
                        if (data.success) {
                          this.props.continue({ id: data.appid });
                        }
                      }}
                    />
                  )}
                </React.Fragment>
              )}
            </>
          );
        }}
      </Query>
    );
  }
}
export default AssignServiceToUser;
