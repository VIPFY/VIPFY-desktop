import * as React from "react";
import { Component } from "react";

class Navigation extends Component {
  state = {
    showNotification: false,
    searchFocus: false
  };

  setApp(appname) {
    this.props.setapp(appname);
  }

  goTo(view) {
    let gotoview = "/area/" + view;
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
            key={`AppLogo-${i}`}
            className="appLogo"
            onClick={() => this.setApp(licence.boughtplanid.planid.appid.name.toLowerCase())}
            style={{
              backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/logos/${
                licence.boughtplanid.planid.appid.logo
              })`
            }}
          />
        );
        i++;
      });
    }

    return appLogos;
  }

  showPopup(showPopup) {
    if (showPopup) {
      return (
        <div className="notificationPopup">
          <div className="notificationPopupHeader">You have 5 notifications</div>
          <div className="notificationPopupScroller">
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
            <div className="notificationItem">
              <span className="fas fa-clipboard-check notificationIcon" />
              <p className="notificationText">Moo successfully installed</p>
              <div className="notificationTime">2 mins ago</div>
            </div>
          </div>
          <div className="notificationPopupFooter">
            <span>Synced at: </span>
            <span className="fas fa-sync" />
          </div>
        </div>
      );
    } else {
      return "";
    }
  }

  toggleNotificationPopup = () => {
    this.setState({ showNotification: !this.state.showNotification });
  };

  toogleSearch = bool => {
    console.log("FOCUS", bool);
    this.setState({ searchFocus: bool });
  };

  render() {
    console.log("NAVI", this.props);
    return (
      <div className={this.props.chatopen ? "navigation chatopen" : "navigation"}>
        <div
          className={this.state.searchFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"}>
          <div className="searchbarButton">
            <i className="fas fa-search" />
          </div>
          <input
            onFocus={() => this.toogleSearch(true)}
            onBlur={() => this.toogleSearch(false)}
            className="searchbar"
            placeholder="Search for something..."
          />
        </div>
        <div className="rightInfos">
          <div className="rightProfileHolder" onClick={this.toggleNotificationPopup}>
            <img className="rightProfileImage" src={this.props.profilepicture} />
            <span className="rightProfileFirstName">{this.props.firstname}</span>
            <span className="rightProfileLastName">{this.props.lastname}</span>
            <span className="rightProfileNotifications">5</span>
            <span className="rightProfileCaret" />
            {this.showPopup(this.state.showNotification)}
          </div>
          <span onClick={() => this.goTo("settings")} className="fas fa-cog navigationRightInfos" />
          <span onClick={this.props.toogleChat} className="fas fa-comments navigationRightInfos" />
        </div>
      </div>
    );
  }
}

export default Navigation;
