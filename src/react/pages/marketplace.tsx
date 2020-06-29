import * as React from "react";
import classNames from "classnames";
import { fetchApps } from "../queries/products";
import QueryWrapper from "../common/QueryWrapper";
import Card from "../components/marketplace/Card";
import { App } from "../interfaces";
import { sortApps } from "../common/functions";
import ErrorPage from "./error";
import welcomeImage from "../../images/onboarding.png";
import { app } from "electron";
import UniversalSearchBox from "../components/universalSearchBox";
import SeparatedSection from "../components/marketplace/SeparatedSection";

interface MarketplaceSectionProps {
  children: any;
}

class MarketplaceSection extends React.PureComponent<MarketplaceSectionProps> {
  render() {
    const { children } = this.props;

    return (
      <SeparatedSection
        className="marketplaceSection"
        hrClassName="marketplaceDivider"
        topSeparator={true}>
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
        <MarketplaceSection>
          <div className="headline" style={{ gridRowStart: 1 }}>
            Discover
          </div>
          <div className="promoted">
            <Card app={DUMMY_APP} format={"wide"} />
          </div>
          <Card app={DUMMY_APP} format={"small"} />
          <Card app={DUMMY_APP} format={"small"} />
          <Card app={DUMMY_APP} format={"small"} />
          <Card app={DUMMY_APP} format={"small"} />
        </MarketplaceSection>

        <MarketplaceSection>
          <div className="headline" style={{ gridRowStart: 2 }}>
            Headline
          </div>
          {/* <Card app={DUMMY_APP} format={"medium"} showPic={true} />
          <Card app={DUMMY_APP} format={"medium"} showPic={true} />
          <Card app={DUMMY_APP} format={"medium"} showPic={true} /> */}
        </MarketplaceSection>

        <UniversalSearchBox>Search a Service in Marketplace</UniversalSearchBox>

        {/* {sortedApps.map(app => ( */}
        {false && (
          <>
            <div>
              {/* example 1-er Card (always with pic) */}
              <Card app={DUMMY_APP} format={"large"} showPic={true} />
            </div>
            <div>
              {/* example 2-er Card (with pic) */}
              <Card app={DUMMY_APP} format={"large"} showPic={true} />
            </div>
            <div>
              {/* example 2-er Card (without pic) */}
              <Card app={DUMMY_APP} format={"large"} />
            </div>
            <div>
              {/* example 3-er Card (with pic) */}
              <Card app={DUMMY_APP} format={"medium"} showPic={true} />
            </div>
            <div>
              {/* example 3-er Card (without pic) */}
              <Card app={DUMMY_APP} format={"medium"} />
            </div>
            <div>
              {/* example 4-er Card (with pic) */}
              <Card app={DUMMY_APP} format={"small"} showPic={true} />
            </div>
            <div>
              {/* example 4-er Card (without pic) */}
              <Card app={DUMMY_APP} format={"small"} />
            </div>
          </>
        )}
        {/* ))} */}
      </div>
    );
  }

  openAppDetails = id => this.props.history.push(`/area/marketplace/${id}/`);

  render() {
    return <QueryWrapper query={fetchApps}>{data => this.renderApps(data.allApps)}</QueryWrapper>;
  }
}

export default Marketplace;
