import * as React from "react";
import { Query, withApollo } from "react-apollo";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";
import Area from "./area";
import PasswordChange from "../components/signin/PasswordChange";
import FirstLogin from "../components/signin/FirstLogin";
import DataNameForm from "../components/dataForms/NameForm";
import { consentText } from "../common/constants";
import gql from "graphql-tag";
import moment = require("moment");
import { filterError } from "../common/functions";

interface PostLoginProps {
  logMeOut: Function;
  moveTo: Function;
  sidebarloaded: Function;
}

interface PostLoginState {}

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

class PostLogin extends React.Component<PostLoginProps, PostLoginState> {
  state: PostLoginState = {};

  shouldComponentUpdate(nextProps, nextState) {
    for (let i in nextProps) {
      if (nextProps[i] !== this.props[i]) {
        console.debug("Übeltäter", i, this.props[i], nextProps[i]);
        if (i !== "showPopup") {
          return true;
        }
      }
    }
    for (let i in nextState) {
      if (nextState[i] !== this.state[i]) {
        console.debug("Übeltäter", i, this.state[i], nextState[i]);
      }
    }
    return false;
  }

  render() {
    console.log("POSTLOGIN", this.props);
    const { context, ...clearprops } = this.props;
    return (
      <Query query={me}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Preparing Vipfy for you" />;
          }

          if (error || !data) {
            return <div>There was an error</div>;
          }

          if (data.me && data.me.consent) {
            window.smartlook("consentAPI", consentText);
            window.smartlook("identify", data.me.id, {
              admin: data.me.isadmin,
              language: data.me.language
            });
          }

          if (!data.me.company.setupfinished) {
            return (
              <div className="centralize backgroundLogo">
                <DataNameForm moveTo={this.props.moveTo} />
              </div>
            );
          }

          if (data.me.firstlogin) {
            return <FirstLogin {...clearprops} />;
          }

          if (data.me.needspasswordchange) {
            return <PasswordChange {...clearprops} />;
          }
          return (
            <Query pollInterval={60 * 60 * 1000 + 10000} query={FETCH_VIPFY_PLAN}>
              {({ data, error, loading }) => {
                if (error) {
                  return filterError(error);
                }
                if (data && data.fetchVipfyPlan) {
                  const vipfyPlan = data.fetchVipfyPlan.plan.name;
                  // TODO: [VIP-314] Reimplement credits when new structure is clear
                  // const { fetchCredits } = data;
                  const expiry = moment(parseInt(data.fetchVipfyPlan.endtime));

                  if (context) {
                    if (moment().isAfter(expiry)) {
                      context.addHeaderNotification(
                        `Your plan ${vipfyPlan} expired. Please choose a new one before continuing`,
                        { type: "error", key: "expire" }
                      );
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
                    {...clearprops}
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

export default PostLogin;
