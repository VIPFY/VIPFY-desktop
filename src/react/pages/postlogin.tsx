import * as React from "react";
import { Query, withApollo } from "react-apollo";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";
import Area from "./area";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import PasswordChange from "../components/signin/PasswordChange";
import FirstLogin from "../components/signin/FirstLogin";
import DataNameForm from "../components/dataForms/NameForm";
import { consentText } from "../common/constants";
import gql from "graphql-tag";
import moment = require("moment");
import { filterError } from "../common/functions";

interface PostLoginProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
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

  render() {
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
            return <FirstLogin {...this.props} />;
          }

          if (data.me.needspasswordchange) {
            return <PasswordChange {...this.props} />;
          }
          return (
            <Query pollInterval={60 * 10 * 1000 + 10000} query={FETCH_VIPFY_PLAN}>
              {({ data, error, loading }) => {
                if (loading) {
                  return "Fetching Credits...";
                }

                if (error || !data) {
                  return filterError(error);
                }

                console.log("PLAN", this.props);

                const vipfyPlan = data.fetchVipfyPlan.plan.name;
                // TODO: [VIP-314] Reimplement credits when new structure is clear
                // const { fetchCredits } = data;
                const expiry = moment(parseInt(data.fetchVipfyPlan.endtime));

                if (this.props.context) {
                  if (moment().isAfter(expiry)) {
                    this.props.context.addHeaderNotification(
                      `Your plan ${vipfyPlan} expired. Please choose a new one before continuing`,
                      { type: "error", key: "expire" }
                    );
                  } else {
                    this.props.context.addHeaderNotification(
                      `${moment().to(expiry, true)} left on ${vipfyPlan}`,
                      { type: "warning", key: "left", dismissButton: { label: "Dismiss" } }
                    );
                  }
                }
                return (
                  <Area
                    {...this.props}
                    style={this.props.context.isactive() ? { height: "calc(100% - 48px)" } : {}}
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
