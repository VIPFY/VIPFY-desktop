import * as React from "react";
import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import Card from "../components/marketplace/Card";
import { App } from "../interfaces";
import { sortApps } from "../common/functions";
import ErrorPage from "./error";
import welcomeImage from "../../images/onboarding.png";
import { app } from "electron";
import SeparatedSection from "../components/marketplace/SeparatedSection";

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
  name: "Dummy App with an extreeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeemely Long Name",
  icon: "Miro/logo.png",
  color: "grey",
  pic: welcomeImage,
  options: { marketplace: true },
  pros: [
    "This is the first pro we provide",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: [
    "Collaboration tools",
    "Gantt charts",
    "Cats",
    "Dogs",
    "Video chat",
    "File sharing",
    "Excel export",
    "Brain wipe",
    "And many, many, many more"
  ]
};

class Marketplace extends React.Component<MarketplaceProps> {
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
        <SeparatedMarketplaceSection hrGridRowStart={0}>
          <div className="headline h1" style={{ gridRowStart: 1 }}>
            Discover
          </div>
          <Card app={DUMMY_APP} isWideFormat={true} style={{ gridRowStart: 2 }} />
          <div className="foursomeGrid" style={{ gridRowStart: 3, gridColumn: "1 / span 12" }}>
            <Card app={DUMMY_APP} />
            <Card app={DUMMY_APP} />
            <Card app={DUMMY_APP} />
            <Card app={DUMMY_APP} />
          </div>
        </SeparatedMarketplaceSection>

        <SeparatedMarketplaceSection hrGridRowStart={4}>
          <div className="headline h2" style={{ gridRowStart: 5 }}>
            Headline
          </div>
          {/* <div className="apps" style={{ gridRowStart: 6 }}>
            <Card app={DUMMY_APP} showPic={true} />
            <Card app={DUMMY_APP} showPic={true} />
            <Card app={DUMMY_APP} showPic={true} />
          </div> */}
        </SeparatedMarketplaceSection>

        <span className="searchBar">Search a Service in Marketplace</span>
      </div>
    );
  }

  openAppDetails = id => this.props.history.push(`/area/marketplace/${id}/`);

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default Marketplace;
