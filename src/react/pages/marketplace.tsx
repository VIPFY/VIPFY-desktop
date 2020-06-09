import * as React from "react";

import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import CardDouble from "../components/marketplace/CardDouble";
import { App } from "../interfaces";
import { sortApps } from "../common/functions";

class Marketplace extends React.Component<{}> {
  renderApps(shuffledApps: App[]) {
    const sortedApps = sortApps(shuffledApps);

    return (
      <div className="marketplace">
        {sortedApps.length > 0 ? (
          sortedApps.map(app => <CardDouble app={app} />)
        ) : (
          <div className="nothingHere">
            <div className="h1">No apps available</div>
            <div className="h2">
              This could mean that VIPFY isn't yet available in your country, or you don't have the
              required permissions.
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
