import * as React from "react";
import { AppOverviewCard, ErrorPage, PageHeader } from "@vipfy-private/vipfy-ui-lib";
import type { App } from "@vipfy-private/vipfy-ui-lib";

import { AppContext, sortApps } from "../../common/functions";
import QueryWrapper from "../../common/QueryWrapper";
import MarketplaceSection from "../../components/marketplace/MarketplaceSection";
import { fetchApps } from "../../queries/products";

interface MarketplaceDiscoverProps {
  history: any;
}

class MarketplaceDiscover extends React.Component<MarketplaceDiscoverProps> {
  goToApp = (appId: string) => this.props.history.push(`/area/marketplace/${appId}`);

  renderApps(apps: App[]) {
    const marketplaceApps = apps.filter(app => app.options?.marketplace);

    if (marketplaceApps.length === 0) {
      return (
        <ErrorPage>
          <p>
            No apps available. Please check your permissions and verify that VIPFY is available in
            your country.
          </p>
        </ErrorPage>
      );
    }

    const sortedApps = sortApps(marketplaceApps);

    return (
      <div className="marketplace page">
        <div className="pageContent">
          <PageHeader
            title="Discover"
            history={this.props.history}
            appContext={AppContext}
            searchItems={[]}
          />

          <div className="marketplaceContent">
            <MarketplaceSection>
              <h2 className="headline">All Apps</h2>
              <div className="apps">
                <div className="grid4Cols smGrid2Cols">
                  {sortedApps.map(app => (
                    <AppOverviewCard
                      app={app}
                      showBackgroundImage={true}
                      showPriceTags={true}
                      onClick={() => this.goToApp(app.id)}
                    />
                  ))}
                </div>
              </div>
            </MarketplaceSection>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default MarketplaceDiscover;
