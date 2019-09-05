import * as React from "react";
import * as ReactDOM from "react-dom";
import gql from "graphql-tag";
import * as moment from "moment";
import { decode } from "jsonwebtoken";
import { withApollo, Query } from "react-apollo";
import { filterError } from "../common/functions";

import UserPicture from "../components/UserPicture";
import PlanHolder from "../components/PlanHolder";
import Duration from "../common/duration";
import PrintEmployeeSquare from "../components/manager/universal/squares/printEmployeeSquare";
import UniversalButton from "../components/universalButtons/universalButton";

const FETCH_VIPFY_PLAN = gql`
  {
    fetchVipfyPlan {
      id
      endtime
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
  sidebarOpen: boolean;
  subscribeToMore: Function;
  toggleSidebar: Function;
  toggleChat: Function;
  id: number;
  viewID: number;
  views: any[];
  openInstances: any[];
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

  backFunction() {
    if (
      this.props.viewID != -1 &&
      document.querySelector(`#webview-${this.props.viewID} webview`) &&
      document.querySelector(`#webview-${this.props.viewID} webview`)!.canGoBack()
    ) {
      document.querySelector(`#webview-${this.props.viewID} webview`)!.goBack();
    } else {
      history.back();
    }
  }

  forwardFunction() {
    if (
      this.props.viewID != -1 &&
      document.querySelector(`#webview-${this.props.viewID} webview`) &&
      document.querySelector(`#webview-${this.props.viewID} webview`)!.canGoForward()
    ) {
      document.querySelector(`#webview-${this.props.viewID} webview`)!.goForward();
    } else {
      history.forward();
    }
  }

  stopImpersonation = async () => {
    const adminToken = localStorage.getItem("impersonator-token");
    localStorage.setItem("token", adminToken!);
    localStorage.removeItem("impersonator-token");

    await this.props.history.push("/area/dashboard");
    this.props.client.cache.reset(); // clear graphql cache

    location.reload();
  };

  render() {
    const { chatOpen, sidebarOpen, data } = this.props;

    if (this.props.loading) {
      return "Initialising Navigation...";
    }

    if (this.props.error) {
      return filterError(this.props.error);
    }

    const token = localStorage.getItem("token");

    const { user, admin } = decode(token);

    return (
      <section
        className={`navigation ${admin ? "info-admin" : ""} ${chatOpen ? "chat-open" : ""}
        ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="leftNavigation">
          <span>
            <button
              type="button"
              className="naked-button genericButton"
              onClick={() => this.backFunction()}
              style={{ float: "left", marginRight: "8px" }}>
              <span className="textButton" style={{ width: "unset" }}>
                <i className="fal fa-long-arrow-left" style={{ paddingRight: "0.2em" }} />
              </span>
            </button>
            <button
              type="button"
              className="naked-button genericButton"
              onClick={() => this.forwardFunction()}>
              <span className="textButton" style={{ width: "unset" }}>
                <i className="fal fa-long-arrow-right" style={{ paddingRight: "0.2em" }} />
              </span>
            </button>
          </span>
        </div>
        {admin && (
          <div className="impersonator">
            <span>{`You are logged in as User ${user.unitid}. You act in his name now!`}</span>
            <UniversalButton
              onClick={this.stopImpersonation}
              type="low"
              label="Stop impersonation"
            />
          </div>
        )}

        <div className="right-infos">
          <Query pollInterval={60 * 10 * 1000 + 10000} query={FETCH_VIPFY_PLAN}>
            {({ data, error, loading }) => {
              if (loading) {
                return "Fetching Credits...";
              }

              if (error || !data) {
                return filterError(error);
              }

              const vipfyPlan = data.fetchVipfyPlan.plan.name;
              // TODO: [VIP-314] Reimplement credits when new structure is clear
              // const { fetchCredits } = data;
              const expiry = moment(parseInt(data.fetchVipfyPlan.endtime));

              return (
                <React.Fragment>
                  <div
                    className="free-month"
                    // TODO: [VIP-315] Implement Logic to change VIPFY Plans
                    // onClick={() =>
                    //   showPopup({
                    //     header: "Choose a Vipfy Plan",
                    //     body: PlanHolder,
                    //     props: {
                    //       currentPlan: 125,
                    //       buttonText: "Select",
                    //       plans: data.fetchPlans,
                    //       updateUpperState: selectedPlan => {
                    //         this.setState({ ...INITIALSTATE, selectedPlan, touched: true });
                    //       }
                    //     }
                    //   })
                    // }
                  >
                    {moment().isAfter(expiry) ? (
                      `Your plan ${vipfyPlan} expired. Please choose a new one before continuing`
                    ) : (
                      <div>{`${moment().to(expiry, true)} left on ${vipfyPlan}`}</div>
                    )}
                  </div>
                  {/* More credit logic */}
                  {/* <div className="credits">
                    {data.fetchCompany.promocode ? (
                      fetchCredits &&
                      fetchCredits.amount > 0 && (
                        <div className="credits-holder">
                          <span>{`${fetchCredits.amount} Vipfy ${fetchCredits.currency}`}</span>
                          <span className="credits-holder-duration">
                            expires{" "}
                            <Duration timestamp={parseInt(fetchCredits.expires)} prefix="in " />
                          </span>
                        </div>
                      )
                    ) : (
                      <span
                        className="free-month"
                        onClick={() => this.props.history.push("/area/profile")}>
                        Use Promocode
                      </span>
                    )}
                  </div> */}
                </React.Fragment>
              );
            }}
          </Query>

          <div className="right-profile-holder">
            <div className="pic-and-name" onClick={() => this.goTo("profile")}>
              <PrintEmployeeSquare
                employee={this.props}
                className="right-profile-image"
                size={32}
              />

              <div className="name-holder">
                <span className="right-profile-first-name" data-recording-sensitive>
                  {this.props.firstname}
                </span>
                <span className="right-profile-last-name" data-recording-sensitive>
                  {this.props.lastname}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default withApollo(Navigation);
