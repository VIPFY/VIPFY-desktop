import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";
import PipedriveGraph from "../graphs/pipedrivegraph";

class Dashboard extends Component {
  state = {
    recommended: false
  };

  setApp(boughtplan: number) {
    this.props.setapp(boughtplan);
  }

  goTo(view) {
    let gotoview = "/area" + view;
    this.props.history.push(gotoview);
  }

  showApps(licences) {
    let appLogos: JSX.Element[] = [];
    console.log("SHOWAPPS", licences);
    if (licences) {
      let i = 0;
      licences.forEach(licence => {
        console.log("L", licence);
        appLogos.push(
          <div
            className="logoAppsTile"
            key={`useableLogo-${i}`}
            onClick={() => this.setApp(licence.boughtplanid.id)}
            style={{
              backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                licence.boughtplanid.planid.appid.logo
              })`
            }}>
            <span className="nameAppsTile">{licence.boughtplanid.planid.appid.name}</span>
          </div>
        );
        i++;
      });
    }
    return appLogos;
  }

  render() {
    console.log("RC", this.props.rcApps);
    let bI = this.props.profilepicture;
    let cssClass = "fullWorking dashboardWorking";
    if (this.props.chatopen) {
      cssClass += " chatopen";
    }
    if (this.props.sidebaropen) {
      cssClass += " SidebarOpen";
    }
    if (this.state.recommended) {
      return (
        <div className={cssClass}>
          <div className="centralize backgroundLogo">
            <div className="loginHolder">
              <div className="recommendedApps">
                <div className="recommendedAppsTitle">We believe you need these services</div>
                <div
                  className="recommendedAppsLogo"
                  onClick={() => this.BuyApp("pipedrive")}
                  style={{
                    backgroundImage:
                      "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png)"
                  }}>
                  <span className="useableServiceName">Pipedrive</span>
                </div>
                <div
                  className="recommendedAppsLogo"
                  onClick={() => this.BuyApp("google apps")}
                  style={{
                    backgroundImage:
                      "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/google-apps.svg)"
                  }}>
                  <span className="useableServiceName">G Suite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={cssClass}>
        <div className="welcomeTile">
          <span className="fas fa-child welcomeIcon" />
          <span className="welcomeText">
            Welcome back, {this.props.firstname} {this.props.lastname}
          </span>
          <div className="welcomeSentence">
            <i className="fas fa-quote-left" />
            <span className="welcomeSentenceText"> Did you know that grass is green? </span>
            <i className="fas fa-quote-right" />
          </div>
        </div>
        <div className="appsTile">{this.showApps(this.props.licences.fetchLicences)}</div>
        <div className="serviceTile">
          <div className="serviceTileHeader">
            <span className="serviceTileHeaderText">Follow our alpha-progress!</span>
          </div>
          <div className="serviceUserHeader">
            <span className="serviceUserIconBackground">
              <img
                className="serviceUserIcon"
                src="https://storage.googleapis.com/vipfy-imagestore-01/artist.jpg"
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
            {this.props.rcApps.loading
              ? "Loading Apps..."
              : this.props.rcApps.fetchRecommendedApps.map(app => (
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
        </div>
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
                    <span className="recommendedServiceName">{app.name}</span>
                  </div>
                ))}
          </div>
        */}
      </div>
    );
  }
}

export default Dashboard;
