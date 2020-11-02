import * as React from "react";
import moment from "moment";
import { ErrorPage, PageHeader } from "@vipfy-private/vipfy-ui-lib";
import { filterLicences, AppContext } from "../common/functions";
import { Licence } from "../interfaces";
import AppList from "../components/profile/AppList";
import SeparatedSection from "../components/SeparatedSection";
import dashboardImg from "../../images/dashboard.png";

const favourites: { [key: number]: Licence | null } = {};
[...Array(8).keys()].map(n => (favourites[n] = null));

interface Props {
  id: string;
  setApp: Function;
  licences: any[];
  isadmin: boolean;
  impersonation?: boolean;
  moveTo: Function;
  history: any;
}

const Dashboard: React.FC<Props> = props => {
  const appLists: {
    "My Favorites": Licence[];
    "My Services": Licence[];
    "Pending Apps": Licence[];
  } = {
    "My Favorites": [],
    "My Services": [],
    "Pending Apps": []
  };

  const hasLicences = props.licences?.length > 0;

  if (hasLicences) {
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
      <PageHeader
        title="My Dashboard"
        history={props.history}
        appContext={AppContext}
        breadCrumbs={[{ label: "Dashboard", to: "/area" }]}
        buttonConfig={{
          label: "Go to Marketplace",
          fAIcon: "fa-store",
          onClick: () => props.moveTo("integrations")
        }}
      />

      {!hasLicences ? (
        <ErrorPage headline="You are not ready yet" img={dashboardImg} hideSupportHint={true}>
          <p>
            It seems that you have not yet integrated any services. In the VIPFY Marketplace you can
            easily integrate your services or purchase new ones.
          </p>
        </ErrorPage>
      ) : (
        Object.keys(appLists).map(list => {
          if (!appLists[list].length) {
            return null;
          }

          return (
            <SeparatedSection>
              <AppList
                key={list}
                header={list}
                licences={filterLicences(appLists[list])}
                setApp={(licence: number) => props.setApp(licence)}
              />
            </SeparatedSection>
          );
        })
      )}
    </div>
  );
};

export default Dashboard;
