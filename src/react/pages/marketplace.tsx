import * as React from "react";

import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import CardDouble from "../components/marketplace/CardDouble";
import { App } from "../interfaces";

class Marketplace extends React.Component<{}> {
  sortApps(apps: App[]) {
    apps.sort((a: App, b: App) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();

      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });
  }

  renderApps(apps: App[]) {
    this.sortApps(apps);

    return (
      <div className="marketplace">
        {apps.length > 0 ? (
          apps.map(app => <CardDouble app={app} />)
        ) : (
          <div className="nothingHere">
            <div className="h1">Nothing here :(</div>
            <div className="h2">
              That commonly means that you don't have enough rights or that VIPFY is not available
              in your country.
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default Marketplace;
