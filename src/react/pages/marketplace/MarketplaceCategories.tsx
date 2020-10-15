import * as React from "react";
import classNames from "classnames";
import { AppOverviewCard, ErrorPage } from "@vipfy-private/vipfy-ui-lib";
import type { App } from "@vipfy-private/vipfy-ui-lib";

import { sortApps } from "../../common/functions";
import QueryWrapper from "../../common/QueryWrapper";
import MarketplaceSection from "../../components/marketplace/MarketplaceSection";
import PageHeader from "../../components/PageHeader";
import { fetchApps } from "../../queries/products";

interface MarketplaceProps {
  history: any;
}

const CATEGORIES = [
  { name: "Finance", icon: "" },
  { name: "Developer Tools", icon: "" },
  { name: "Productivity", icon: "" },
  { name: "Support", icon: "" },
  { name: "Social Media", icon: "" },
  { name: "Sales", icon: "" },
  { name: "Marketing", icon: "" },
  { name: "Design", icon: "" },
  { name: "Business", icon: "" },
  { name: "Communication", icon: "" },
  { name: "Management", icon: "" },
  { name: "Backoffice", icon: "" }
];

class MarketplaceCategories extends React.Component<MarketplaceProps> {
  goToApp = (appId: string) => this.props.history.push(`/area/marketplace/categories/${appId}`);

  renderCategory(categoryName: string, icon: string) {
    icon = "fa-moon";

    return (
      <div key={categoryName} className="category">
        <div className={classNames("fal fa-fw", icon)} />
        <div className="categoryName">{categoryName}</div>
      </div>
    );
  }

  renderApps(apps: App[]) {
    const marketplaceApps = apps.filter(app => app.options?.marketplace);
    console.log(marketplaceApps);

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
          <PageHeader title="Categories" searchConfig={{ text: "Search an App in Marketplace" }}>
            <div className="categories grid6Cols smGrid3Cols">
              {CATEGORIES.map(category => this.renderCategory(category.name, category.icon))}
            </div>
          </PageHeader>

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

export default MarketplaceCategories;
