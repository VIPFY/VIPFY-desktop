import * as React from "react";
import { ErrorPage, PageHeader } from "@vipfy-private/vipfy-ui-lib";
import type { App } from "@vipfy-private/vipfy-ui-lib";
import { fetchApps } from "../../queries/products";
import QueryWrapper from "../../common/QueryWrapper";
import AppOverviewCard from "../../components/marketplace/AppOverviewCard";
import welcomeImage from "../../../images/onboarding.png";
import MarketplaceSection from "../../components/marketplace/MarketplaceSection";
import { AppContext } from "../../common/functions";

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
    "This is the first pro we provide, and it is a very complicated explanation.",
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
    "And many, many, many, many, many, many, many, many, many, many, many, many, many, many, many more"
  ]
};

class MarketplaceDiscover extends React.Component<MarketplaceDiscoverProps> {
  goToApp = (appId: number) => this.props.history.push(`/area/marketplace/${appId}`);

  renderApps(apps: App[]) {
    const marketplaceApps = apps.filter(app => app.options?.marketplace);

    if (!marketplaceApps.length) {
      return (
        <ErrorPage>
          <p>
            No apps available. Please check your permissions and verify that VIPFY is available in
            your country.
          </p>
        </ErrorPage>
      );
    }

    return (
      <div className="marketplace page">
        <div className="pageContent">
          <PageHeader
            title="Discover"
            history={this.props.history}
            appContext={AppContext}
            searchConfig={{ text: "Search an App in Marketplace" }}
          />

          <div className="marketplaceContent">
            <MarketplaceSection className="apps" hrStyle={{ display: "none" }}>
              <AppOverviewCard
                app={DUMMY_APP}
                isWideFormat={true}
                onClick={() => this.goToApp(DUMMY_APP.id)}
              />
              <div className="grid4Cols smGrid2Cols">
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
                <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
                <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
              </div>
            </MarketplaceSection>

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
                  <AppOverviewCard app={DUMMY_APP} onClick={() => this.goToApp(DUMMY_APP.id)} />
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
