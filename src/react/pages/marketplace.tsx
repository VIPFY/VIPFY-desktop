import * as React from "react";

import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import CardDouble from "../components/marketplace/CardDouble";
import { App } from "../interfaces";
import { sortApps, ErrorComp } from "../common/functions";

class Marketplace extends React.Component<{}> {
  renderApps(shuffledApps: App[]) {
    if (shuffledApps.length == 0) {
      return (
        <ErrorComp
          error={
            "No apps available. Please check your permissions and VIPFY's availability in your country."
          }
        />
      );
    }

    const sortedApps = sortApps(shuffledApps);

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
