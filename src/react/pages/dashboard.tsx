import * as React from "react";
import moment from "moment";
import AppList from "../components/profile/AppList";
import { filterLicences } from "../common/functions";
import { Link } from "react-router-dom";
import { Licence } from "../interfaces";
import dashboardPic from "../../images/dashboard.png";
import PageHeader from "../components/PageHeader";

const favourites: { [key: number]: Licence | null } = {};
[...Array(8).keys()].map(n => (favourites[n] = null));

interface Props {
  id: string;
  setApp: Function;
  licences: any[];
  isadmin: Boolean;
  impersonation?: boolean;
}

export default (props: Props) => {
  const appLists: {
    "My Favorites": Licence[];
    "My Services": Licence[];
    "Pending Apps": Licence[];
  } = {
    "My Favorites": [],
    "My Services": [],
    "Pending Apps": []
  };

  const licenceCheck = props.licences && props.licences.length > 0;

  if (licenceCheck) {
    props.licences.forEach(licence => {
      if (!(props.impersonation && licence.options && licence.options.private)) {
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
      <PageHeader title="My Dashboard" buttonConfig={{ label: "Go to Marketplace" }} />
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
            {props.isadmin ? (
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
        <React.Fragment>
          {Object.keys(appLists).map(list => {
            if (appLists[list].length > 0) {
              return (
                <AppList
                  key={list}
                  header={list}
                  licences={filterLicences(appLists[list])}
                  setApp={(licence: number) => props.setApp(licence)}
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
};
