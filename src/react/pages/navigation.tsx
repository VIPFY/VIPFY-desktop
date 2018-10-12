import * as React from "react";
import * as ReactDOM from "react-dom";
import gql from "graphql-tag";
import { withApollo } from "react-apollo";
import Notification from "../components/Notification";
import { filterError, sleep } from "../common/functions";
import { fetchLicences } from "../queries/auth";
import { FETCH_DOMAINS } from "./domains";
import { fetchUnitApps } from "../queries/departments";
import { fetchCards } from "../queries/billing";
import UserPicture from "../components/UserPicture";

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription onNewNotification {
    newNotification {
      id
      sendtime
      message
      icon
      changed
    }
  }
`;

const DUMMY_QUERY = gql`
  mutation {
    ping {
      ok
    }
  }
`;

interface Props {
  chatOpen: boolean;
  firstname: string;
  history: any;
  lastname: string;
  data: any;
  error: any;
  loading: boolean;
  profilepicture: string;
  refetch: Function;
  setApp: Function;
  sideBarOpen: boolean;
  subscribeToMore: Function;
  toggleSidebar: Function;
  toggleChat: Function;
  userid: number;
}

interface State {
  searchFocus: boolean;
  showNotification: boolean;
  notify: boolean;
}

class Navigation extends React.Component<Props, State> {
  state = {
    searchFocus: false,
    showNotification: false,
    notify: false
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

    this.props.subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || subscriptionData.error) {
          console.log(subscriptionData);
          return prev;
        }

        this.setState({ notify: true });
        console.log("gotNotifiaction", subscriptionData);
        setTimeout(() => this.setState({ notify: false }), 5000);

        this.refetchCategories(subscriptionData.data.newNotification.changed, this.props.client);

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

  async refetchCategories(categories, client) {
    await sleep(2000);
    for (const category of categories) {
      console.log("refetch category", category);
      if (category == "ownLicences") {
        await client.query({
          query: fetchLicences,
          errorPolicy: "ignore",
          fetchPolicy: "network-only"
        });
      } else if (category == "domains") {
        await client.query({
          query: FETCH_DOMAINS,
          errorPolicy: "ignore",
          fetchPolicy: "network-only"
        });
      } else if (category == "foreignLicences") {
        // refetchQueries of the mutate functions can refetch observed queries by name,
        // using the variables used by the query observer
        // that's the easiest way to get this functionality
        await client.mutate({
          mutation: DUMMY_QUERY,
          errorPolicy: "ignore",
          fetchPolicy: "no-cache",
          refetchQueries: ["fetchUnitApps", "fetchUsersOwnLicences"]
        });
      } else if (category == "paymentMethods") {
        await client.query({
          query: fetchCards,
          errorPolicy: "ignore",
          fetchPolicy: "network-only"
        });
      }
    }
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

    console.log("P", this.props);
    return (
      <div
        className={`navigation ${chatOpen ? "chat-open" : ""}
        ${sideBarOpen ? "side-bar-open" : ""}`}>
        <div className="leftNavigation">
          <span onClick={toggleSidebar} className="fas fa-bars barIcon" />
          {/*<div
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
          </div>*/}
        </div>

        <div className="right-infos">
          <div className="right-profile-holder">
            <div className="pic-and-name" onClick={() => this.goTo("profile")}>
              <UserPicture size="right-profile-image" unitid={this.props.id} />

              <div className="name-holder">
                <span className="right-profile-first-name">{this.props.firstname}</span>
                <span className="right-profile-last-name">{this.props.lastname}</span>
              </div>
            </div>

            <span onClick={this.toggleNotificationPopup} className="right-profile-holder">
              <span
                className={`right-profile-notifications ${this.state.notify ? "notify-user" : ""}`}>
                <i className="far fa-bell" />
                <span className="notification-amount">
                  {!loading && !data && !data.fetchNotifications
                    ? 0
                    : data.fetchNotifications.length}
                </span>
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

          {/*<span
            onClick={this.props.toggleChat}
            className="fas fa-comments navigation-right-infos"
          />*/}
        </div>
      </div>
    );
  }
}

export default withApollo(Navigation);
