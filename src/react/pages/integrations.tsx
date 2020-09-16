import * as React from "react";
import { Query } from "@apollo/client/react/components";

import { fetchApps } from "../queries/products";
import LoadingDiv from "../components/LoadingDiv";
import UniversalSearchBox from "../components/universalSearchBox";
import PopupSSO from "../popups/universalPopups/PopupSSO";
import AppCardIntegrations from "../components/services/appCardIntegrations";
import SelfSaving from "../popups/universalPopups/SelfSavingIllustrated";
import { SSO, WorkAround } from "../interfaces";
import { ErrorComp } from "../common/functions";

export type AppPageState = {
  popupSSO: boolean;
  searchstring: String;
  showLoading: boolean;
  ownSSO: SSO;
};

class Integrations extends React.Component<{}, AppPageState> {
  state = {
    popupSSO: false,
    searchstring: "",
    showLoading: false,
    ownSSO: {}
  };

  render() {
    return (
      <Query<WorkAround, WorkAround> query={fetchApps}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error) {
            return <ErrorComp error={error} />;
          }

          if (data.allApps.length < 1) {
            if (this.state.searchstring === "") {
              return (
                <div className="nothingHere">
                  <div className="h1">Nothing here :(</div>
                  <div className="h2">
                    That commonly means that you don't have enough rights or that VIPFY is not
                    available in your country.
                  </div>
                </div>
              );
            } else {
              return (
                <div className="nothingHere">
                  <div className="h1">Nothing here :(</div>
                  <div className="h2">We have no apps that fit your search.</div>
                </div>
              );
            }
          }

          const apps = data.allApps.filter(element => {
            if (element.options && element.options.pending) {
              return false;
            }

            return element.name.toLowerCase().includes(this.state.searchstring.toLowerCase());
          });

          apps.sort(function (a, b) {
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
            <div className="integrations">
              <div className="header">
                <UniversalSearchBox
                  placeholder="Search for an service..."
                  getValue={value => this.setState({ searchstring: value })}
                />

                <button
                  type="button"
                  className="button-external"
                  onClick={() =>
                    /*this.setState({ popupSSO: true })*/ this.props.moveTo("addcustomservice")
                  }>
                  <i className="fal fa-universal-access" />
                  <span>Add your own Service</span>
                </button>
              </div>
              {apps.map(details => (
                <AppCardIntegrations
                  {...details}
                  key={details.id}
                  icon={details.icon ? details.icon : details.logo}
                  isEmployee={true}
                />
              ))}

              {this.state.popupSSO && (
                <React.Fragment>
                  <PopupSSO
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
                    <SelfSaving
                      sso={this.state.ownSSO}
                      //  maxTime={7000}
                      closeFunction={() => this.setState({ showLoading: false, popupSSO: false })}
                      isEmployee={true}
                    />
                  )}
                </React.Fragment>
              )}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default Integrations;
