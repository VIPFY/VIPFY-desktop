import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import UserName from "../../components/UserName";
import UniversalButton from "../../components/universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";
import PopupBase from "./popupBase";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";

const FORCE_2FA = gql`
  mutation onForce2FA($userid: ID!) {
    force2FA(userid: $userid)
  }
`;

const UN_FORCE_2FA = gql`
  mutation onUnForce2FA($userid: ID!) {
    unForce2FA(userid: $userid)
  }
`;

interface Props {
  closeFunction: Function;
  unitid: number;
  status: boolean;
}

export default (props: Props) => (
  <Mutation
    mutation={props.status ? UN_FORCE_2FA : FORCE_2FA}
    update={cache => {
      const { fetchUserSecurityOverview } = cache.readQuery({
        query: FETCH_USER_SECURITY_OVERVIEW
      });

      const updated = fetchUserSecurityOverview.map(user => {
        if (user.id == props.unitid) {
          user.needstwofa = !user.needstwofa;
        }

        return user;
      });

      cache.writeQuery({
        query: FETCH_USER_SECURITY_OVERVIEW,
        data: { fetchUserSecurityOverview: updated }
      });
    }}>
    {(toggle2FA, { loading, error = null, data }) => (
      <PopupBase
        buttonStyles={{ justifyContent: "space-around" }}
        small={true}
        close={props.closeFunction}>
        <h1>{props.status ? "Force" : "Unforce"} Two-Factor Authentication</h1>
        {data ? (
          <React.Fragment>
            <div className="sub-header">
              {props.status ? "Forcing" : "Unforcing"} Two-Factor Authentication was successful
            </div>
            <UniversalButton onClick={() => props.closeFunction()} type="high" label="ok" />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="sub-header">
              Do you really want to {props.status ? "un" : ""}force{" "}
              <UserName unitid={props.unitid} /> to use Two-Factor Authentication?
            </div>

            <ErrorComp error={error} className="error-field" />
            <UniversalButton
              type="low"
              onClick={props.closeFunction}
              disabled={loading}
              closingPopup={true}
              label="no"
            />

            <UniversalButton
              type="low"
              disabled={loading || data}
              onClick={() => toggle2FA({ variables: { userid: props.unitid, type: "totp" } })}
              label="Yes"
            />
          </React.Fragment>
        )}
      </PopupBase>
    )}
  </Mutation>
);
