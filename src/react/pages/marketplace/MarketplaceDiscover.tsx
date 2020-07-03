import * as React from "react";
import { fetchApps } from "../../queries/products";
import QueryWrapper from "../../common/QueryWrapper";
import Card from "../../components/marketplace/Card";
import { App } from "../../interfaces";
import { sortApps } from "../../common/functions";
import ErrorPage from "../error";
import welcomeImage from "../../../images/onboarding.png";
import MarketplaceSection from "../../components/marketplace/MarketplaceSection";

interface MarketplaceDiscoverProps {
  history: any;
}

const DUMMY_APP = {
  name: "Dummy App",
  id: 123,
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

class MarketplaceDiscover extends React.Component<MarketplaceDiscoverProps> {
  openAppDetails = (id: number) => this.props.history.push(`/area/marketplace/${id}/`);

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
          <div className="marketplaceHeader headline">
            <h1 style={{ gridRowStart: 1 }}>Discover</h1>
            <span className="searchBar">Search an App in Marketplace</span>
          </div>

          <div className="marketplaceContent">
            <MarketplaceSection className="apps" hrStyle={{ display: "none" }}>
              <Card
                app={DUMMY_APP}
                isWideFormat={true}
                onClick={() => this.openAppDetails(DUMMY_APP.id)}
              />
              <div className="multipleOfFourGrid">
                <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
                <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
                <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
                <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
              </div>
            </MarketplaceSection>

            <MarketplaceSection>
              <h2 className="headline">Headline</h2>
              <div className="apps">
                <div className="multipleOfThreeGrid">
                  <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
                  <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
                  <Card app={DUMMY_APP} onClick={() => this.openAppDetails(DUMMY_APP.id)} />
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
