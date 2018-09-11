import * as React from "react";
import PipedriveGraph from "../graphs/pipedrivegraph";
import LoadingDiv from "../components/LoadingDiv";
import { filterError } from "../common/functions";

interface Props {
  firstname: string;
  history: any;
  lastname: string;
  rcApps: any;
  setApp: Function;
}

interface State {
  recommended: boolean;
}

class Dashboard extends React.Component<Props, State> {
  state = {
    recommended: false
  };

  setApp = (licence: number) => this.props.setApp(licence);

  goTo = view => this.props.history.push(`/area${view}`);

  showApps(licences) {
    let appLogos: JSX.Element[] = [];

    if (licences) {
      if (licences.length > 0) {
        licences.forEach((licence, key) => {
          console.log("App", licence);
          appLogos.push(
            <div
              className="logoAppsTile"
              key={`useableLogo-${key}`}
              onClick={() => this.setApp(licence.id)}
              style={{
                backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                  licence.boughtplanid.planid.appid.icon
                })`
              }}>
              <span className="nameAppsTile">{licence.boughtplanid.planid.appid.name}</span>
            </div>
          );
        });
      } else {
        appLogos.push(<div className="noApp">No Apps for you at the moment :(</div>)
      }
    }
    return appLogos;
  }

  showRec(licences) {
    console.log("PROPS", this.props)
    let recLogo: JSX.Element[] = [];
    let recApps = [];

    if (licences) {
      if !(licences.find(function(e) {
        return e.boughtplanid.planid.appid.id === 2;
      })) {
        recApps.push(2)
      }
      if !(licences.find(function(e) {
        return e.boughtplanid.planid.appid.id === 4;
      })) {
        recApps.push(4)
      }
      if !(licences.find(function(e) {
        return e.boughtplanid.planid.appid.id === 27;
      })) {
        recApps.push(27)
      }

      if (recApps.length > 0) {
        recApps.forEach((element, key) => {
          switch (element){
            case 2:
            recLogo.push(<div
              className="logoAppsTile"
              key={`useableLogo-${key}`}
              onClick={() => this.props.moveTo("marketplace/2")}
              style={{
                backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/icons/weebly.jpg)"
              }}>
              <span className="nameAppsTile">Weebly</span>
            </div>)
            break;
            case 4:
            recLogo.push(<div
              className="logoAppsTile"
              key={`useableLogo-${key}`}
              onClick={() => this.props.moveTo("marketplace/4"}
              style={{
                backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/icons/pipedrive.png)"
              }}>
              <span className="nameAppsTile">Pipedrive</span>
            </div>)
            break;
            case 27:
            recLogo.push(<div
              className="logoAppsTile"
              key={`useableLogo-${key}`}
              onClick={() => this.props.moveTo("marketplace/27"}
              style={{
                backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/icons/20082018-e368x-sendgrid-png)"
              }}>
              <span className="nameAppsTile">SendGrid</span>
            </div>)
            break;
          }
        })
      }
    }
    if (recLogo.length > 0){
      return <div className="appsTile">{recLogo}</div>
    }
    return <div className="noApp">No have everything you really need at the moment :)</div>
  }

  render() {
    const { rcApps } = this.props;
    console.log("RC", rcApps);
    // let bI = this.props.profilepicture;
    if (rcApps.loading) {
      return <LoadingDiv text="Fetching Recommendations..." />;
    }

    if (rcApps.error) {
      return filterError(rcApps.error);
    }

    /*if (this.state.recommended) {
      return (
        <div className="centralize backgroundLogo">
          <div className="login-holder">
            <div className="recommendedApps">
              <div className="recommendedAppsTitle">We believe you need these services</div>
              <div
                className="recommendedAppsLogo"
                style={{
                  backgroundImage:
                    "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png)"
                }}>
                <span className="useable-service-name">Pipedrive</span>
              </div>
              <div
                className="recommendedAppsLogo"
                style={{
                  backgroundImage:
                    "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/google-apps.svg)"
                }}>
                <span className="useable-service-name">G Suite</span>
              </div>
            </div>
          </div>
        </div>
      );
    }*/

    return (
      <div className="dashboard-working">
        {/*<div className="welcomeTile">
          <span className="fas fa-child welcomeIcon" />
          <span className="welcomeText">
            Welcome back, {this.props.firstname} {this.props.lastname}
          </span>
          <div className="welcomeSentence">
            <i className="fas fa-quote-left" />
            <span className="welcomeSentenceText"> Did you know that grass is green? </span>
            <i className="fas fa-quote-right" />
          </div>
    </div>*/}
        <div className="dashboardHeading">
          <div>My Apps</div>
        </div>
        <div className="appsTile">{this.showApps(this.props.licences.fetchLicences)}</div>
        <div className="dashboardHeading">
          <div>Our Recommendations</div>
        </div>
        {this.showRec(this.props.licences.fetchLicences)}
        {/*<div className="serviceTile">
          <div className="serviceTileHeader">
            <span className="serviceTileHeaderText">Follow our alpha-progress!</span>
          </div>
          <div className="serviceUserHeader">
            <span className="serviceUserIconBackground">
              <img
                className="serviceUserIcon"
                src="https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/artist.jpg"
              />
            </span>
            <span className="serviceUserName">Nils Vossebein</span>
            <span className="serviceTime">30mins ago</span>
          </div>
          <div className="serviceText">
            Register on vipfy.com to get our newsletter and always be up to date!
          </div>
        </div>
        <div className="informationTile">
          <div className="informationTileHeader">
            <span className="informationTileHeaderText">
              We believe you also need these services
            </span>
          </div>
          <div className="informationText">
            {rcApps.fetchRecommendedApps.map(app => (
              <div
                key={app.id}
                className="rcLogoAppsTile"
                onClick={() => this.goTo(`/marketplace/${app.id}`)}
                style={{
                  backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                    app.logo
                  })`
                }}>
                <span className="nameAppsTile">{app.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="informationGraph">
          <div className="informationGraphHeader">
            <span className="informationGraphHeaderText">Pipedrive conversion rate</span>
          </div>
          <div className="informationGraphContent">
            <PipedriveGraph />
          </div>
          </div>*/}
        {/*
          <div className="welcomeHolder">
            <div className="welcomeImage" style={{ backgroundImage: `url(${bI})` }} />
            <div className="welcomeMessage">
              <span>
                Welcome back, {this.props.firstname} {this.props.lastname}
              </span>
            </div>
          </div>

          <div className="useableApps">
            <div className="useableAppsTitle">Just click on a service to start</div>
            {this.showApps(this.props.licences.fetchLicences)}
          </div>
          <div className="recommendedApps">
            <div className="recommendedAppsTitle">We believe you also need these services</div>
            {this.props.rcApps.loading
              ? "Loading Apps..."
              : this.props.rcApps.fetchRecommendedApps.map(app => (
                  <div
                    key={app.id}
                    className="recommendedAppsLogo"
                    onClick={() => this.goTo(`marketplace/${app.id}`)}
                    style={{
                      backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                        app.logo
                      })`
                    }}>
                    <span className="recommended-service-name">{app.name}</span>
                  </div>
                ))}
          </div>
        */}
      </div>
    );
  }
}

export default Dashboard;
