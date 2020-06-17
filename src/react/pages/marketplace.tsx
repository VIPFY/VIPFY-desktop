import * as React from "react";

import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import CardDouble from "../components/marketplace/CardDouble";
import { App } from "../interfaces";
import { sortApps } from "../common/functions";
import ErrorPage from "./error";

interface Props {
  history: any;
}

class Marketplace extends React.Component<Props> {
  renderApps(apps: App[]) {
    // const marketplaceApps = apps.filter(app => app.options.marketplace);
    const marketplaceApps = apps.filter(app => app.name === "Miro");

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
        {sortedApps.map(app => (
          <CardDouble app={app} key={app.id} onClick={() => this.openAppDetails(app.id)} />
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
