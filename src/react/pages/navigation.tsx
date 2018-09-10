import * as React from "react";
import * as ReactDOM from "react-dom";
import gql from "graphql-tag";
import Notification from "../components/Notification";
import { filterError } from "../common/functions";

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

interface Props {
  chatOpen: boolean;
  firstname: string;
  history: Function;
  lastname: string;
  data: any;
  error: any;
  loading: boolean;
  profilepicture: string;
  setApp: Function;
  sideBarOpen: boolean;
  subscribeToMore: Function;
  toggleSidebar: Function;
  userid: number;
}

interface State {
  searchFocus: boolean;
  showNotification: boolean;
}

class Navigation extends React.Component<Props, State> {
  state = {
    searchFocus: false,
    showNotification: false
  };

  setApp = (boughtplan: number) => this.props.setApp(boughtplan);

  goTo = view => this.props.history.push(`/area/${view}`);

  listenKeyboard = e => {
    if (e.key === "Escape" || e.keyCode === 27) {
      this.setState({ showNotification: false });
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
    document.addEventListener("click", this.handleClickOutside, true);
    console.log(this.props);
    this.props.subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      variables: { receiver: this.props.userid },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || subscriptionData.error) {
          console.log(subscriptionData);
          return prev;
        }

        return Object.assign({}, prev, {
          fetchNotifications: [subscriptionData.data.newNotification, ...prev.fetchNotifications]
        });
      }
    });
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

  toggleSearch = searchFocus => this.setState({ searchFocus });

  render() {
    const { chatOpen, sideBarOpen, data, error, loading, toggleSidebar } = this.props;

    if (loading) {
      return "Initialising Navigation...";
    }

    if (error) {
      return filterError(error);
    }

    return (
      <div
        className={`navigation ${chatOpen ? "chat-open" : ""}
        ${sideBarOpen ? "side-bar-open" : ""}`}>
        <div className="leftNavigation">
          <span onClick={toggleSidebar} className="fas fa-bars barIcon" />
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
          <div className="right-profile-holder">
            <div className="pic-and-name" onClick={() => this.goTo("profile")}>
              <img
                className="right-profile-image"
                src={`https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                  this.props.profilepicture
                }`}
              />

              <div className="name-holder">
                <span className="right-profile-first-name">{this.props.firstname}</span>
                <span className="right-profile-last-name">{this.props.lastname}</span>
              </div>
            </div>

            <span onClick={this.toggleNotificationPopup} className="right-profile-holder">
              <span className="right-profile-notifications">
                {!loading && !data && !data.fetchNotifications ? 0 : data.fetchNotifications.length}
              </span>
              <span className="right-profile-caret" />
            </span>

            {this.state.showNotification ? (
              <Notification data={data} refetch={this.props.refetch} />
            ) : (
              ""
            )}
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
