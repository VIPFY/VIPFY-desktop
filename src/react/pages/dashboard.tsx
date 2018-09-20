import * as React from "react";
import PipedriveGraph from "../graphs/pipedrivegraph";
import LoadingDiv from "../components/LoadingDiv";
import { filterError } from "../common/functions";
import Popup from "../components/Popup";
import Welcome from "../popups/welcome";

interface Props {
  firstname: string;
  history: any;
  lastname: string;
  rcApps: any;
  setApp: Function;
}

interface State {
  recommended: boolean;
  popup: boolean;
}

class Dashboard extends React.Component<Props, State> {
  state = {
    recommended: false,
    popup: true
  };

  setApp = (licence: number) => this.props.setApp(licence);

  goTo = view => this.props.history.push(`/area${view}`);

  closePopup = () => this.setState({ popup: null });

  showApps(licences) {
    let appLogos: JSX.Element[] = [];

    if (licences) {
      if (licences.length > 0) {
        licences.forEach((licence, key) => {
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
        return <div className="noApp">No Apps for you at the moment :(</div>
      }
    }
    return appLogos;
  }

  showRec(licences) {
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
    if (recLogo.length > 0) {
      return <div className="appsTile">{recLogo}</div>
    }
    return <div className="noApp">You have everything you really need at the moment :)</div>
  }

  render() {

    console.log(this.props)
    const { rcApps } = this.props;
    if (rcApps.loading) {
      return <LoadingDiv text="Fetching Recommendations..." />;
    }

    if (rcApps.error) {
      return filterError(rcApps.error);
    }

    return (
      <div className="dashboard-working">
        <div className="dashboardHeading">
          <div>My Apps</div>
        </div>
        <div className="appsTile">{this.showApps(this.props.licences.fetchLicences)}</div>
        <div className="dashboardHeading">
          <div>Our Recommendations</div>
        </div>
        {this.showRec(this.props.licences.fetchLicences)}
        {this.state.popup ? (
          <Popup
            popupHeader="Welcome to VIPFY!"
            popupBody={Welcome}
            bodyProps={null}
            onClose={this.closePopup}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default Dashboard;
