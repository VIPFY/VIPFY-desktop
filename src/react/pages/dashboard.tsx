import * as React from "react";
import AppList from "../components/profile/AppList";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError, filterAndSort } from "../common/functions";
import UniversalSearchBox from "../components/universalSearchBox";
import { Link } from "react-router-dom";
import moment = require("moment");

interface Props {
  firstname: string;
  history: any;
  lastname: string;
  rcApps: any;
  setApp: Function;
  moveTo: Function;
  licences: any;
  placeid?: string;
  disableWelcome: Function;
  addressProposal?: object;
  vatId: string;
  statisticData: object;
}

interface State {
  search: string;
}

class Dashboard extends React.Component<Props, State> {
  state = { search: "" };

  render() {
    const setApp = (licence: number) => this.props.setApp(licence);

    if (this.props.licences.loading) {
      return <LoadingDiv text="Fetching Licences..." />;
    }

    if (this.props.licences.error) {
      return <ErrorComp error={filterError(this.props.licences.error)} />;
    }

    const appLists = {
      "External Apps": [],
      "Pending Apps": [],
      "Temporary Apps": []
    };

    let allLicences = [];

    if (this.props.licences && this.props.licences.fetchLicences.length > 0) {
      this.props.licences.fetchLicences.forEach(licence => {
        if (licence.pending) {
          appLists["Pending Apps"].push(licence);
        } else if (licence.tags.length > 0) {
          if (licence.vacationstart && moment().isBefore(moment(licence.vacationend))) {
            appLists["Temporary Apps"].push(licence);
          }
        } else {
          appLists["External Apps"].push(licence);
        }
      });

      allLicences = filterAndSort(this.props.licences.fetchLicences, "dashboard");
    }

    return (
      <div className="dashboard">
        <div className="heading">
          <h1>Dashboard</h1>
          <UniversalSearchBox getValue={v => this.setState({ search: v })} />
        </div>
        {this.props.licences && allLicences.length < 1 ? (
          <div className="no-apps">
            <div>This is your</div>
            <h1>DASHBOARD</h1>
            <div>
              It's a central point of information about your connected services and licenses.
            </div>
            <img src={`${__dirname}/../../images/dashboard.png`} alt="Cool pic of a dashboard" />
            <div>You haven't integrated any services yet.</div>
            <div>
              Go to <Link to="/area/integrations">Integrating Accounts</Link> to integrate your
              services.
            </div>
          </div>
        ) : (
          <React.Fragment>
            {Object.keys(appLists).map(list => {
              if (appLists[list].length > 0) {
                return (
                  <AppList
                    header={list}
                    allLicences={allLicences}
                    search={this.state.search}
                    licences={filterAndSort(appLists[list], "dashboard")}
                    setApp={setApp}
                  />
                );
              } else {
                return null;
              }
            })}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default Dashboard;
