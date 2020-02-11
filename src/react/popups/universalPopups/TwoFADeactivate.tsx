import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import UserName from "../../components/UserName";
import { ErrorComp } from "../../common/functions";
import UniversalButton from "../../components/universalButtons/universalButton";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";

interface Props {
  unitid: number;
  closeFunction: Function;
}

const TWO_FA_DEACTIVATE = gql`
  mutation onDeactivate2FA($userid: ID!) {
    deactivate2FA(userid: $userid)
  }
`;

export default (props: Props) => {
  return (
    <Mutation
      mutation={TWO_FA_DEACTIVATE}
      update={cache => {
        const { fetchUserSecurityOverview } = cache.readQuery({
          query: FETCH_USER_SECURITY_OVERVIEW
        });

        const updated = fetchUserSecurityOverview.map(user => {
          if (user.id == props.unitid) {
            user.needstwofa = false;
            user.twofactormethods = [];
          }

          return user;
        });

        cache.writeQuery({
          query: FETCH_USER_SECURITY_OVERVIEW,
          data: { fetchUserSecurityOverview: updated }
        });

        props.closeFunction();
      }}>
      {(deactivate2FA, { data, loading, error }) => (
        <PopupBase
          small={true}
          buttonStyles={{ marginTop: "56px", justifyContent: "space-between" }}
          close={props.closeFunction}>
          <h1>
            Deactivate Two-Factor Authentication of <UserName unitid={props.unitid} />
          </h1>
          <div className="sub-header">
            This will disable all Two-Factor Methods used by the user and significantly decrease his
            account security. Only do this if he has no way to recover his methods.
          </div>

          <ErrorComp error={error} className="error-field" />
          <UniversalButton
            type="low"
            onClick={props.closeFunction}
            disabled={loading}
            closingPopup={true}
            label="cancel"
          />

          <UniversalButton
            type="high"
            disabled={loading || data}
            onClick={() => deactivate2FA({ variables: { userid: props.unitid } })}
            label="Confirm"
          />
        </PopupBase>
      )}
    </Mutation>
  );
};
