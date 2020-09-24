import * as React from "react";
import moment from "moment";
import AppList from "../components/profile/AppList";
import { filterLicences } from "../common/functions";
import UniversalSearchBox from "../components/universalSearchBox";
import { Link } from "react-router-dom";
import { Licence } from "../interfaces";
import dashboardPic from "../../images/dashboard.png";
<<<<<<< HEAD
=======
import { graphql } from "@apollo/client/react/hoc";
import compose from "lodash.flowright";
import gql from "graphql-tag";
>>>>>>> origin/master

const favourites: { [key: number]: Licence | null } = {};
[...Array(8).keys()].map(n => (favourites[n] = null));

interface Props {
  id: string;
  setApp: Function;
  licences: any[];
  switchLayout: Function;
  isadmin: Boolean;
  impersonation?: boolean;
}

interface State {
  search: string;
  dragItem: number | null;
  showDeletion: boolean;
}

class Dashboard extends React.Component<Props, State> {
  state = { search: "", dragItem: null, showDeletion: false };

  favouriteListRef = React.createRef<HTMLDivElement>();

  dragStartFunction = (item: number): void => {
    console.log("LOG: Dashboard -> item", item);
    this.setState({ dragItem: item, showDeletion: true });
  };
  dragEndFunction = (): void => this.setState({ dragItem: null, showDeletion: false });
  setApp = (licence: number) => this.props.setApp(licence);

  render() {
    const appLists: {
      "My Favorites": Licence[];
      "My Services": Licence[];
      "Pending Apps": Licence[];
    } = {
      "My Favorites": [],
      "My Services": [],
      "Pending Apps": []
    };

    const licenceCheck = this.props.licences && this.props.licences.length > 0;

    if (licenceCheck) {
      this.props.licences.forEach(licence => {
        if (!(this.props.impersonation && licence.options && licence.options.private)) {
          if (
            !licence.disabled &&
            !licence.pending &&
            !licence.boughtplanid.planid.appid.disabled &&
            (moment(licence.boughtplanid.endtime).isAfter() ||
              licence.boughtplanid.endtime == null) &&
            (moment(licence.endtime).isAfter() || licence.endtime == null)
          ) {
            if (licence.dashboard !== null && licence.dashboard <= 8) {
              favourites[licence.dashboard] = licence;
            }
            if (licence.pending) {
              appLists["Pending Apps"].push(licence);
            } else {
              if (licence.tags.includes("favorite")) {
                appLists["My Favorites"].push(licence);
              } else {
                appLists["My Services"].push(licence);
              }
            }
          }
        }
      });
    }

    return (
      <div className="dashboard page">
        <div className="heading">
          <h1>Dashboard</h1>
          <UniversalSearchBox getValue={v => this.setState({ search: v })} />
        </div>
        {!licenceCheck ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "64px" }}>
            <div className="no-apps">
              <div>This is your</div>
              <h1>DASHBOARD</h1>
              <div>
                It's a central point of information about your connected services and licenses.
              </div>
              <img src={dashboardPic} alt="Cool pic of a dashboard" />
              <div>You haven't integrated any services yet.</div>
              {this.props.isadmin ? (
                <div>
                  Go to <Link to="/area/integrations">Integrating Accounts</Link> to integrate your
                  services.
                </div>
              ) : (
                  <div>Please ask your administrator to integrate Services for you</div>
                )}
            </div>
          </div>
        ) : (
<<<<<<< HEAD
          <React.Fragment>
            {Object.keys(appLists).map(list => {
              if (appLists[list].length > 0) {
                return (
                  <AppList
                    key={list}
                    header={list}
                    dragStartFunction={this.dragStartFunction}
                    dragEndFunction={this.dragEndFunction}
                    search={this.state.search}
                    licences={filterLicences(appLists[list])}
                    setApp={this.setApp}
                  />
                );
              } else {
                return null;
              }
            })}
          </React.Fragment>
        )}
=======
            <React.Fragment>
              {Object.keys(appLists).map(list => {
                if (appLists[list].length > 0) {
                  return (
                    <AppList
                      key={list}
                      header={list}
                      dragStartFunction={this.dragStartFunction}
                      dragEndFunction={this.dragEndFunction}
                      search={this.state.search}
                      licences={filterLicences(appLists[list])}
                      setApp={this.setApp}
                      width={this.props.width}
                    />
                  );
                } else {
                  return null;
                }
              })}
            </React.Fragment>
          )}
>>>>>>> origin/master
      </div>
    );
  }
}

export default Dashboard;
