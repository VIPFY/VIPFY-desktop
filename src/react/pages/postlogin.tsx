import * as React from "react";
import { Query, withApollo } from "react-apollo";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";
import Area from "./area";
import PasswordChange from "../components/signin/PasswordChange";
import FirstLogin from "../components/signin/FirstLogin";
import GoogleAuth from "../popups/universalPopups/GoogleAuth";
import moment from "moment";
import { concatName } from "../common/functions";
import { WorkAround, Expired_Plan } from "../interfaces";
import { FETCH_VIPFY_PLAN } from "../queries/departments";

interface PostLoginProps {
  logMeOut: Function;
  moveTo: Function;
  sidebarloaded: Function;
  showPopup: Function;
  qrCode?: string;
  twoFAid?: string;
  employess: number;
  profilepicture: string;
  history: any;
  context: any;
  addUsedLicenceID: Function;
  expiredPlan: Expired_Plan;
  closePlanModal: Function;
  [moreProps: string]: any;
  firstname: string;
  middlename: string;
  lastname: string;
}

interface State {
  firstLogin: boolean;
}

class PostLogin extends React.Component<PostLoginProps, State> {
  state = { firstLogin: false };

  reachedArea = false;

  render() {
    const isImpersonating = !!localStorage.getItem("impersonator-token");

    return (
      <Query<WorkAround, WorkAround> query={me}>
        {({ data, loading, error, refetch }) => {
          const { context, ...pureProps } = this.props;

          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data || !data.me) {
            return <div>There was an error</div>;
          }

          if (data.me && data.me.consent) {
            window.smartlook(
              "consentAPI",
              `This awesome App uses software to offer you an amazing experience, analyse your use of our App
            and provide content from third parties. By using our App, you acknowledge that you have read and
            understand our Privacy Policies and Terms of Service and that you consent to them.`
            );
            window.smartlook("identify", data.me.id, {
              admin: data.me.isadmin,
              language: data.me.language
            });
          }

          if (isImpersonating) {
            context.addHeaderNotification(
              `You are impersonating the User ${concatName(pureProps)}`,
              {
                type: "impersonation",
                key: "impersonator",
                dismissButton: {
                  label: "Stop Impersonation",
                  dismissFunction: this.props.logMeOut
                }
              }
            );

            pureProps.impersonation = true;
          }
          const setupfinished = data.me.company.setupfinished;

          if (data.me.firstlogin && !this.state.firstLogin && !isImpersonating) {
            return (
              <div className="loginHolder">
                <div className="card loginCard">
                  <FirstLogin
                    setFirstLogin={() => this.setState({ firstLogin: true })}
                    {...pureProps}
                  />
                </div>
              </div>
            );
          }

          if (data.me.needspasswordchange && !this.reachedArea && !isImpersonating) {
            return (
              <div className="loginHolder">
                <div className="card loginCard">
                  <PasswordChange firstLogin={this.state.firstLogin} {...pureProps} />
                </div>
              </div>
            );
          }

          if (data.me.needstwofa) {
            return (
              <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
                <GoogleAuth
                  dontClose={true}
                  finishSetup={() => {
                    refetch();
                    pureProps.history.push("/area/dashboard");
                  }}
                  user={data.me}
                />
              </div>
            );
          }

          if (!this.reachedArea) {
            this.reachedArea = true;
          }

          return (
            <Query<WorkAround, WorkAround>
              pollInterval={60 * 60 * 1000 + 10000}
              query={FETCH_VIPFY_PLAN}>
              {({ data, error: e2 }) => {
                if (e2) {
                  console.error(e2);
                }

                if (data && data.fetchVipfyPlan && data.fetchVipfyPlan.endtime) {
                  const vipfyPlan = data.fetchVipfyPlan.plan.name;
                  // TODO: [VIP-314] Reimplement credits when new structure is clear
                  // const { fetchCredits } = data;

                  if (context) {
                    const expiry = moment(parseInt(data.fetchVipfyPlan.endtime));

                    if (moment().isAfter(expiry)) {
                      context.addHeaderNotification(
                        `Your plan ${vipfyPlan} expired. Please choose a new one before continuing`,
                        { type: "error", key: "expire" }
                      );
                    } else if (moment().add(3, "months").isBefore(expiry)) {
                      // nothing to do
                    } else {
                      context.addHeaderNotification(
                        `${moment().to(expiry, true)} left on ${vipfyPlan}`,
                        { type: "warning", key: "left", dismissButton: { label: "Dismiss" } }
                      );
                    }
                  }
                }

                return (
                  <Area
                    {...pureProps}
                    showVIPFYPlanPopup={e2}
                    setupfinished={setupfinished}
                    globalMeRefetch={() => refetch()}
                    style={context.isActive ? { height: "calc(100% - 40px)" } : {}}
                  />
                );
              }}
            </Query>
          );
        }}
      </Query>
    );
  }
}

export default withApollo(PostLogin);
