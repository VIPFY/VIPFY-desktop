import * as React from "react";
import { Component } from "react";
import { Link } from "react-router-dom";

class Dashboard extends Component {
  state = {
    recommended: false
  };

  setApp(appname) {
    this.props.setapp(appname);
  }

  goTo(view) {
    let gotoview = "/area/" + view;
    this.props.history.push(gotoview);
  }

  showApps(licences) {
    let appLogos = [];
    console.log("SHOWAPPS", licences);
    if (licences) {
      let i = 0;
      licences.forEach(licence => {
        console.log("L", licence);
        appLogos.push(
          <div
            className="useableAppsLogo"
            key={`useableLogo-${i}`}
            onClick={() =>
              this.setApp(licence.boughtplanid.planid.appid.name.toLowerCase())
            }
            style={{
              backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                licence.boughtplanid.planid.appid.logo
              })`
            }}>
            <span className="useableServiceName">
              {licence.boughtplanid.planid.appid.name}
            </span>
          </div>
        );
        i++;
      });
    }
    return appLogos;
  }

  render() {
    console.log(this.props.rcApps);
    let bI = this.props.profilepicture;
    if (this.state.recommended) {
      return (
        <div className="fullWorking">
          <div className="centralize backgroundLogo">
            <div className="loginHolder">
              <div className="recommendedApps">
                <div className="recommendedAppsTitle">
                  We believe you need these services
                </div>
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
      <div className="fullWorking">
        <div className="welcomeHolder">
          <div
            className="welcomeImage"
            style={{ backgroundImage: `url(${bI})` }}
          />
          <div className="welcomeMessage">
            <span>
              Welcome back, {this.props.firstname} {this.props.lastname}
            </span>
          </div>
        </div>

        <div className="useableApps">
          <div className="useableAppsTitle">
            Just click on a service to start
          </div>
          {/*<div className="useableAppsLogo" onClick={() => (this.setApp("pipedrive"))}
            style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/pipedrive.png)"}}>
            <span className="useableServiceName">Pipedrive</span>
          </div>
          <div className="useableAppsLogo" onClick={() => (this.setApp("slack"))}
            style={{backgroundImage: "url(https://storage.googleapis.com/vipfy-imagestore-01/logos/slack.svg)"}}>
            <span className="useableServiceName">Slack</span>
    </div>*/}
          {this.showApps(this.props.licences.fetchLicences)}
        </div>
        <div className="recommendedApps">
          <div className="recommendedAppsTitle">
            We believe you also need these services
          </div>
          {this.props.rcApps.loading
            ? "Loading Apps..."
            : this.props.rcApps.fetchRecommendedApps.map(app => (
                <div key={app.id}
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
      </div>
    );
  }
}

export default Dashboard;
