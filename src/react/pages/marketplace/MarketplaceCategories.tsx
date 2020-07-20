import * as React from "react";
import classNames from "classnames";

import { fetchApps } from "../../queries/products";
import QueryWrapper from "../../common/QueryWrapper";
import AppOverviewCard from "../../components/marketplace/AppOverviewCard";
import { App } from "../../interfaces";
import { sortApps } from "../../common/functions";
import ErrorPage from "../error";
import welcomeImage from "../../../images/onboarding.png";
import Tag from "../../common/Tag";
import MarketplaceSection from "../../components/marketplace/MarketplaceSection";
import PageHeader from "../../components/PageHeader";

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

const DUMMY_APP = {
  name: "Dummy App",
  icon: "Miro/logo.png",
  color: "grey",
  pic: welcomeImage,
  options: { marketplace: true },
  pros: ["Seamlessly integrated", "Organized in a centralized pool", "Available at all times"],
  features: ["Collaboration tools", "Gantt charts", "Video chat", "File sharing", "Excel export"]
};

class MarketplaceCategories extends React.Component<MarketplaceProps> {
  goToApp = (appId: number) => this.props.history.push(`/area/marketplace/app/${appId}/`);

  renderCategory(categoryName: string, icon: string) {
    icon = "fa-star";

    return (
      <Tag key={categoryName}>
        <span>
          <span className={classNames("fal", "fa-fw", icon)} />
          <span className="categoryName">{categoryName}</span>
        </span>
      </Tag>
    );
  }

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
        <div className="marketplaceContainer">
          <PageHeader title="Categories" searchConfig={{ text: "Search an App in Marketplace" }}>
            <div className="categories grid6Cols smGrid3Cols">
              {CATEGORIES.map(category => this.renderCategory(category.name, category.icon))}
            </div>
          </PageHeader>

          <div className="marketplaceContent">
            <MarketplaceSection>
              <h2 className="headline">Headline</h2>
              <div className="apps">
                <div className="grid3Cols smGrid1Col">
                  <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
                  <AppOverviewCard
                    app={DUMMY_APP}
                    showPic={true}
                    onClick={() => this.goToApp(DUMMY_APP.id)}
                  />
                  <AppOverviewCard
                    app={DUMMY_APP}
                    showPic={true}
                    onClick={() => this.goToApp(DUMMY_APP.id)}
                  />
                </div>
              </div>
            </MarketplaceSection>

            <MarketplaceSection>
              <h2 className="headline">Headline</h2>
              <div className="apps">
                <div className="grid4Cols smGrid2Cols">
                  <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
                  <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
                  <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
                  <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
                </div>
                <AppOverviewCard
                  app={DUMMY_APP}
                  isWideFormat={true}
                  onClick={() => this.goToApp(DUMMY_APP.id)}
                />
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
