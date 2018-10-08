import * as React from "react";
import FreshdeskWidget from "@personare/react-freshdesk-widget";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";

interface Props {}

class SupportPage extends React.Component<Props> {
  render() {
    console.log("SUPP", this.props);
    return (
      <div id="profile-page">
        <Query query={me}>
          {({ loading, error, data }) => {
            if (loading) {
              return <LoadingDiv />;
            }

            if (error) {
              return (
                <div>
                  There was an internal error, please go to our external support support page //TODO
                </div>
              );
            }

            const requester = data.me.emails[0].email;
            return <FreshdeskWidget url="https://vipfy.freshdesk.com" autofill={{ requester }} disable={["requester"]}/>;
          }}
        </Query>
      </div>
    );
  }
}

export default SupportPage;
