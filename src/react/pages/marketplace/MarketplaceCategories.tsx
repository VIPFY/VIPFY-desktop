import * as React from "react";
import { fetchApps } from "../../queries/products";
import QueryWrapper from "../../common/QueryWrapper";
import Card from "../../components/marketplace/Card";
import { App } from "../../interfaces";
import { sortApps } from "../../common/functions";
import ErrorPage from "../error";
import welcomeImage from "../../../images/onboarding.png";
import SeparatedSection from "../../components/marketplace/SeparatedSection";

function SeparatedMarketplaceSection(props: { children: any }) {
  return <SeparatedSection topSeparator={true}>{props.children}</SeparatedSection>;
}

interface MarketplaceProps {
  history: any;
}

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
        <div className="marketplaceHeader headline">
          <h1 style={{ gridRowStart: 1 }}>Categories</h1>
          <span className="searchBar">Search a Service in Marketplace</span>
        </div>

        <div className="marketplaceContent">
          <SeparatedMarketplaceSection>
            <h2 className="headline">Headline</h2>
            <div className="apps">
              <div className="multipleOfThreeGrid">
                <Card app={DUMMY_APP} showPic={true} />
                <Card app={DUMMY_APP} showPic={true} />
                <Card app={DUMMY_APP} showPic={true} />
              </div>
            </div>
          </SeparatedMarketplaceSection>

          <SeparatedMarketplaceSection>
            <h2 className="headline">Headline</h2>
            <div className="apps">
              <div className="multipleOfFourGrid">
                <Card app={DUMMY_APP} />
                <Card app={DUMMY_APP} />
                <Card app={DUMMY_APP} />
                <Card app={DUMMY_APP} />
              </div>
              <Card app={DUMMY_APP} isWideFormat={true} />
            </div>
          </SeparatedMarketplaceSection>
        </div>
      </div>
    );
  }

  openAppDetails = id => this.props.history.push(`/area/marketplace/${id}/`);

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default MarketplaceCategories;
