import * as React from "react";
import { fetchApps } from "../../queries/products";
import QueryWrapper from "../../common/QueryWrapper";
import Card from "../../components/marketplace/Card";
import { App } from "../../interfaces";
import { sortApps } from "../../common/functions";
import ErrorPage from "../error";
import welcomeImage from "../../../images/onboarding.png";
import SeparatedSection from "../../components/marketplace/SeparatedSection";

interface SeparatedMarketplaceSectionProps {
  hrGridRowStart: number;
  children: any;
}

class SeparatedMarketplaceSection extends React.PureComponent<SeparatedMarketplaceSectionProps> {
  render() {
    const { children, hrGridRowStart } = this.props;

    return (
      <SeparatedSection topSeparator={true} hrStyle={{ gridRowStart: hrGridRowStart }}>
        {children}
      </SeparatedSection>
    );
  }
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
        <div className="marketplaceHeader">
          <h1 className="headline" style={{ gridRowStart: 1 }}>
            Discover
          </h1>
          <span className="searchBar">Search a Service in Marketplace</span>
        </div>

        <div className="marketplaceContent">
          <SeparatedMarketplaceSection hrGridRowStart={1}>
            <h2 className="headline" style={{ gridRowStart: 2 }}>
              Headline
            </h2>
            <div
              className="multipleOfThreeGrid"
              style={{ gridRowStart: 3, gridColumn: "1 / span 12" }}>
              <Card app={DUMMY_APP} showPic={true} />
              <Card app={DUMMY_APP} showPic={true} />
              <Card app={DUMMY_APP} showPic={true} />
            </div>
          </SeparatedMarketplaceSection>

          <SeparatedMarketplaceSection hrGridRowStart={4}>
            <h2 className="headline" style={{ gridRowStart: 5 }}>
              Headline
            </h2>
            <div
              className="multipleOfFourGrid"
              style={{ gridRowStart: 6, gridColumn: "1 / span 12" }}>
              <Card app={DUMMY_APP} />
              <Card app={DUMMY_APP} />
              <Card app={DUMMY_APP} />
              <Card app={DUMMY_APP} />
            </div>
            <Card app={DUMMY_APP} isWideFormat={true} style={{ gridRowStart: 7 }} />
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
