import * as React from "react";
import * as ReactDOM from "react-dom";
import gql from "graphql-tag";
import * as moment from "moment";
import { withApollo, Query } from "react-apollo";
import Notification from "../components/Notification";
import { filterError, sleep, refetchQueries, AppContext } from "../common/functions";
import { fetchLicences } from "../queries/auth";
import { FETCH_DOMAINS } from "../components/domains/graphql";
import { fetchCards } from "../queries/billing";
import UserPicture from "../components/UserPicture";
import PlanHolder from "../components/PlanHolder";
import Duration from "../common/duration";
import VoteForApp from "../popups/appVote";

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

const FETCH_CREDIT_DATA = gql`
  {
    fetchCredits {
      id
      amount
      currency
      spentfor
      expires
    }

    fetchCompany {
      createdate
      promocode
    }

    fetchPlans(appid: 66) {
      id
      price
      appid {
        id
        options
        features
        name
        options
        logo
        icon
      }
      features
      name
      currency
      numlicences
      teaserdescription
      options
      optional
      payperiod
      gotoplan {
        id
        numlicences
        currency
        price
        optional
        payperiod
        name
        teaserdescription
        options
      }
    }

    fetchVipfyPlan {
      id
      plan: planid {
        id
        name
      }
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
  id: number;
}

interface State {
  searchFocus: boolean;
  showNotification: boolean;
  notify: boolean;
}

const INITIALSTATE = {
  searchFocus: false,
  showNotification: false,
  notify: false
};

class Navigation extends React.Component<Props, State> {
  state = INITIALSTATE;

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
          console.log("%c Subscription", "background: red;", subscriptionData);
          return prev;
        }

        this.setState({ notify: true });
        //console.log("gotNotifiaction", subscriptionData);
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
      const options = {
        errorPolicy: "ignore",
        fetchPolicy: "network-only"
      };
      //console.log("refetch category", category);
      switch (category) {
        case "ownLicences":
          await client.query({
            query: fetchLicences,
            ...options
          });
          break;

        case "domains":
          await client.query({
            query: FETCH_DOMAINS,
            ...options
          });
          break;

        case "foreignLicences":
          await refetchQueries(client, ["fetchUnitApps", "fetchUsersOwnLicences"]);
          break;

        case "invoices":
          await refetchQueries(client, ["fetchBills"]);
          break;

        case "paymentMethods":
          await client.query({
            query: fetchCards,
            ...options
          });
          break;

        case "promocode":
          await client.query({
            query: FETCH_CREDIT_DATA,
            ...options
          });
          break;
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
    const { chatOpen, sideBarOpen, data } = this.props;

    if (this.props.loading) {
      return "Initialising Navigation...";
    }

    if (this.props.error) {
      return filterError(this.props.error);
    }

    return (
      <div
        className={`navigation ${chatOpen ? "chat-open" : ""}
        ${sideBarOpen ? "side-bar-open" : ""}`}>
        <div className="leftNavigation">
          <span>
            <AppContext.Consumer>
              {({ showPopup }) => (
                <button
                  type="button"
                  className="naked-button genericButton"
                  onClick={() =>
                    showPopup({
                      header: "Vote for new Integrations",
                      body: VoteForApp,
                      props: {}
                    })
                  }>
                  <span className="textButton" style={{ width: "unset" }}>
                    <i className="fal fa-poll-people" style={{ paddingRight: "0.2em" }} />
                    Missing an Integration? Vote here
                  </span>
                </button>
              )}
            </AppContext.Consumer>
            <button
              type="button"
              className="naked-button genericButton"
              onClick={() =>
                history.back()
              }>
              <span className="textButton" style={{ width: "unset" }}>
                <i className="fal fa-long-arrow-left" style={{ paddingRight: "0.2em" }} />
                
              </span>
            </button>
          </span>
          {/*<span onClick={toggleSidebar} className="fas fa-bars barIcon" />*/}
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
          {/*<Query query={FETCH_CREDIT_DATA}>
            {({ data, error, loading }) => {
              if (loading) {
                return "Fetching Credits...";
              }

              if (error || !data) {
                return filterError(error);
              }

              const vipfyPlan = data.fetchVipfyPlan.plan.name;
              const { fetchCredits } = data;
              const expiry = moment(parseInt(data.fetchCompany.createdate)).add(1, "months");

              return (
                <AppContext.Consumer>
                  {({ showPopup }) => (
                    <React.Fragment>
                      <div
                        className="free-month"
                        onClick={() =>
                          showPopup({
                            header: "Choose a Vipfy Plan",
                            body: PlanHolder,
                            props: {
                              currentPlan: 125,
                              buttonText: "Select",
                              plans: data.fetchPlans,
                              updateUpperState: selectedPlan => {
                                console.log(selectedPlan);
                                this.setState({ ...INITIALSTATE, selectedPlan, touched: true });
                              }
                            }
                          })
                        }>
                        {moment().isAfter(expiry) ? (
                          vipfyPlan
                        ) : (
                          <div>{`${moment().to(expiry, true)} left on free trial`}</div>
                        )}
                      </div>
                      <div className="credits">
                        {data.fetchCompany.promocode ? (
                          fetchCredits && fetchCredits.amount > 0 ? (
                            <div className="credits-holder">
                              <span>{`${fetchCredits.amount} Vipfy ${fetchCredits.currency}`}</span>
                              <span className="credits-holder-duration">
                                expires{" "}
                                <Duration timestamp={parseInt(fetchCredits.expires)} prefix="in " />
                              </span>
                            </div>
                          ) : (
                            ""
                          )
                        ) : (
                          <span
                            className="free-month"
                            onClick={() => this.props.history.push("/area/profile")}>
                            Use Promocode
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  )}
                </AppContext.Consumer>
              );
            }}
          </Query>*/}

          <div className="credits">Free in Beta</div>

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
                  {!this.props.loading && !data && !data.fetchNotifications
                    ? 0
                    : data.fetchNotifications.length}
                </span>
              </span>
              <span className="right-profile-caret" />
            </span>

            {this.state.showNotification ? (
              <Notification data={data} refetch={this.props.refetch}/>
            ) : (
              ""
            )}
          </div>

          {/*<span
            onClick={() => this.goTo("settings")}
            className="fas fa-cog navigation-right-infos"
          />

          <span
            onClick={this.props.toggleChat}
            className="fas fa-comments navigation-right-infos"
          />*/}
        </div>
      </div>
    );
  }
}

export default withApollo(Navigation);
