import * as React from "react";
import { Component } from "react";
import { AppContext } from "../common/functions";

class Navigation extends Component {
  state = {
    showNotification: false,
    searchFocus: false
  };

  setApp(boughtplan: number) {
    this.props.setApp(boughtplan);
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
            onClick={() => this.setApp(licence.boughtplanid.id)}
            style={{
              backgroundImage: `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${
                licence.boughtplanid.planid.appid.icon
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
    this.setState(prevState => ({ showNotification: !prevState.showNotification }));
  };

  toggleSearch = bool => this.setState({ searchFocus: bool });

  render() {
    console.log("NAVI", this.props);
    return (
      <div
        className={`navigation ${this.props.chatOpen ? "chat-open" : ""}
        ${this.props.sideBarOpen ? "side-bar-open" : ""}`}>
        <div className="leftNavigation">
          <span onClick={this.props.toggleSidebar} className="fas fa-bars barIcon" />
          <div
            className={
              this.state.searchFocus ? "searchbarHolder searchbarFocus" : "searchbarHolder"
            }>
            <div className="searchbarButton">
              <i className="fas fa-search" />
            </div>
            <input
              onFocus={() => this.toggleSearch(true)}
              onBlur={() => this.toggleSearch(false)}
              className="searchbar"
              placeholder="Search for something..."
            />
          </div>
        </div>

        <div className="right-infos">
          <div className="right-profile-holder" onClick={this.toggleNotificationPopup}>
            <img
              className="right-profile-image"
              src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                this.props.profilepicture
              }`}
            />
            <span className="right-profile-first-name">{this.props.firstname}</span>
            <span className="right-profile-last-name">{this.props.lastname}</span>
            <span className="right-profile-notifications">5</span>
            <span className="right-profile-caret" />
            {this.showPopup(this.state.showNotification)}
          </div>

          <span
            onClick={() => this.goTo("settings")}
            className="fas fa-cog navigation-right-infos"
          />

          <span
            onClick={this.props.toggleChat}
            className="fas fa-comments navigation-right-infos"
          />
        </div>
      </div>
    );
  }
}

export default Navigation;
