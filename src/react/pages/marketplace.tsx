import * as React from "react";

import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import Card from "../components/marketplace/Card";
import { App } from "../interfaces";
import { sortApps } from "../common/functions";
import ErrorPage from "./error";
import welcomeImage from "../../images/onboarding.png";

interface Props {
  history: any;
}

const DUMMY_APP = {
  name: "Dummy App",
  icon: "Miro/logo.png",
  color: "grey",
  pic: welcomeImage,
  options: { marketplace: true },
  pros: [
    "This is the first pro we provide",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: [
    "Collaboration tools",
    "Gantt charts",
    "Video chat",
    "File sharing",
    "Excel export",
    "Brain wipe",
    "And many, many more"
  ]
};

class Marketplace extends React.Component<Props> {
  renderApps(apps: App[]) {
    const marketplaceApps = apps.filter(app => app.options.marketplace);

    if (marketplaceApps.length == 0) {
      return (
        <ErrorPage>
          No apps available. Please check your permissions and verify that VIPFY is available in
          your country.
        </ErrorPage>
      );
    }

    const sortedApps = sortApps(marketplaceApps);

    return (
      <div className="marketplace">
        {sortedApps.map((app, i) => (
          <Card
            app={DUMMY_APP}
            colSpan={(i % 4) + 1}
            key={app.id}
            onClick={() => this.openAppDetails(app.id)}
          />
        ))}
        {sortedApps.map((app, i) => (
          <Card
            showPic={true}
            app={DUMMY_APP}
            colSpan={(i % 4) + 1}
            key={app.id}
            onClick={() => this.openAppDetails(app.id)}
          />
        ))}
      </div>
    );
  }

  openAppDetails = id => this.props.history.push(`/area/marketplace/${id}/`);

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default Marketplace;
