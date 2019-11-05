import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import UserName from "../../components/UserName";
import UniversalButton from "../../components/universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";
import PopupBase from "./popupBase";
import { SecurityContext } from "../../pages/security";

const IMPERSONATE = gql`
  mutation onImpersonate($unitid: ID!) {
    impersonate(userid: $unitid)
  }
`;

interface Props {
  closeFunction: Function;
  unitid: number;
}

export default (props: Props) => (
  <SecurityContext.Consumer>
    {({ history, client }) => (
      <Mutation
        mutation={IMPERSONATE}
        onCompleted={async data => {
          const token = localStorage.getItem("token");
          localStorage.setItem("token", data.impersonate);
          localStorage.setItem("impersonator-token", token!);

          await history.push("/area/dashboard");
          client.cache.reset(); // clear graphql cache

          location.reload();

          props.closeFunction();
        }}>
        {(impersonate, { loading, error }) => (
          <PopupBase
            buttonStyles={{ justifyContent: "space-between" }}
            small={true}
            close={props.closeFunction}>
            <h1>Impersonate Account</h1>
            <div>
              Do you really want to impersonate <UserName unitid={props.unitid} />?
            </div>

            <ErrorComp error={error} className="error-field" />

            <UniversalButton type="low" disabled={loading} closingPopup={true} label="no" />
            <UniversalButton
              type="low"
              disabled={loading}
              onClick={() => impersonate({ variables: { unitid: props.unitid } })}
              label="Yes"
            />
          </PopupBase>
        )}
      </Mutation>
    )}
  </SecurityContext.Consumer>
);
