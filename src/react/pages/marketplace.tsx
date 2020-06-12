import * as React from "react";

import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import CardDouble from "../components/marketplace/CardDouble";
import { App } from "../interfaces";
import { sortApps } from "../common/functions";
import ErrorPage from "./error";

class Marketplace extends React.Component<{}> {
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
        {sortedApps.map(app => (
          <CardDouble app={app} />
        ))}
      </div>
    );
  }

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default Marketplace;
