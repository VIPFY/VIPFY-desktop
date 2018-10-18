import * as React from "react";
import { Query, withApollo } from "react-apollo";
import { me } from "../queries/auth";
import LoadingDiv from "../components/LoadingDiv";
import Area from "./area";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { CHANGE_PASSWORD } from "../mutations/auth";
import PasswordChange from "../components/signin/PasswordChange";
import FirstLogin from "../components/signin/FirstLogin";

interface PostLoginProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
}

interface PostLoginState {}

class PostLogin extends React.Component<PostLoginProps, PostLoginState> {
  state: PostLoginState = {};

  render() {
    return (
      <Query query={me}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Preparing Vipfy for you" />;
          }

          if (error) {
            return <div>There was an error</div>;
          }

          if (data.me.firstlogin) {
            return <FirstLogin {...this.props} />;
          }

          if (data.me.needspasswordchange) {
            return <PasswordChange {...this.props} />;
          }
          return <Area {...this.props} />;
        }}
      </Query>
    );
  }
}

export default withApollo(PostLogin);
