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
import GoogleAuth from "../popups/universalPopups/GoogleAuth";

interface PostLoginProps {
  logMeOut: Function;
  client: ApolloClient<InMemoryCache>;
  moveTo: Function;
  sidebarloaded: Function;
  setName: Function;
  showPopup: Function;
  qrCode?: string;
  twoFAid?: string;
  employess: number;
  profilepicture: string;
  history: any;
}

const PostLogin = (props: PostLoginProps) => (
  <Query query={me}>
    {({ data, loading, error, refetch }) => {
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
            <DataNameForm moveTo={props.moveTo} />
          </div>
        );
      }

      if (data.me.firstlogin) {
        return <FirstLogin {...props} />;
      }

      if (data.me.needspasswordchange) {
        return <PasswordChange {...props} />;
      }

      if (data.me.needstwofa) {
        return (
          <div style={{ display: "flex", flexFlow: "column", alignItems: "center" }}>
            <h1>Please set up Two-Factor Authentication</h1>
            <GoogleAuth
              finishSetup={() => {
                refetch();
                props.history.push("/area/dashboard");
              }}
              user={data.me}
            />
          </div>
        );
      }

      return <Area {...props} />;
    }}
  </Query>
);

export default withApollo(PostLogin);
