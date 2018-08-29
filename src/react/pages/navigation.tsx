import * as React from "react";
import * as ReactDOM from "react-dom";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Notification from "../components/Notification";
import { FETCH_NOTIFICATIONS } from "../queries/notification";

interface State {
  searchFokus: boolean;
  showNotification: boolean;
}

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription onNewNotification($receiver: Int!) {
    newNotification(receiver: $receiver) {
      id
      sendtime
      message
      icon
    }
  }
`;

class Navigation extends React.Component<State> {
  state = {
    searchFocus: false,
    showNotification: false
  };

  setApp(boughtplan: number) {
    this.props.setApp(boughtplan);
  }

  goTo(view) {
    let gotoview = "/area/" + view;
    this.props.history.push(gotoview);
  }

  listenKeyboard = e => {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.setState({ showNotification: false });
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
    document.addEventListener("click", this.handleClickOutside, true);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
    document.removeEventListener("click", this.handleClickOutside, true);
  }

  handleClickOutside = e => {
    const domNode = ReactDOM.findDOMNode(this);

    if (!domNode || !domNode.contains(e.target)) {
      this.setState({ showNotification: false });
    }
  };

  toggleNotificationPopup = () => {
    this.setState(prevState => ({ showNotification: !prevState.showNotification }));
  };

  toggleSearch = bool => this.setState({ searchFocus: bool });

  render() {
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
          <Query
            query={FETCH_NOTIFICATIONS}
            pollInterval={600000}
            variables={{ receiver: this.props.userid }}>
            {res => (
              <div className="right-profile-holder">
                <img
                  className="right-profile-image"
                  src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                    this.props.profilepicture
                  }`}
                />
                <span className="right-profile-first-name">{this.props.firstname}</span>
                <span className="right-profile-last-name">{this.props.lastname}</span>

                <span onClick={this.toggleNotificationPopup} className="right-profile-holder">
                  <span className="right-profile-notifications">
                    {res.loading ? 0 : res.data.fetchNotifications.length}
                  </span>
                  <span className="right-profile-caret" />
                </span>

                {this.state.showNotification ? <Notification {...res} /> : ""}
              </div>
            )}
          </Query>

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
