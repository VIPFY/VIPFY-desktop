import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import UserName from "../UserName";
import { FETCH_VACATION_REQUESTS } from "./graphql";
import { ErrorComp } from "../../common/functions";
import UniversalButton from "../universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import vacation from "src/react/pages/vacation";

const APPROVE_REQUEST = gql`
  mutation onApproveVacationRequest($userid: ID!, $requestid: ID!) {
    approveVacationRequest(userid: $userid, requestid: $requestid)
  }
`;

const DECLINE_REQUEST = gql`
  mutation onDeclineVacationRequest($userid: ID!, $requestid: ID!) {
    declineVacationRequest(userid: $userid, requestid: $requestid)
  }
`;

interface Props {
  close: Function;
  id: number;
  decission: string;
  requestID: number;
}

export default (props: Props) => (
  <Mutation
    mutation={props.decission == "confirm" ? APPROVE_REQUEST : DECLINE_REQUEST}
    update={proxy => {
      const cachedData = proxy.readQuery({ query: FETCH_VACATION_REQUESTS });

      const vacationRequests = cachedData.fetchVacationRequests
        .find(emp => emp.id == props.id)
        .vacationRequests.map(request => {
          if (request.id == props.requestID) {
            request.status = props.decission == "confirm" ? "CONFIRMED" : "REJECTED";
            request.decided = Date.now();
          }

          return request;
        });

      const fetchVacationRequests = cachedData.fetchVacationRequests;
      fetchVacationRequests.find(emp => emp.id == props.id).vacationRequests = vacationRequests;

      proxy.writeQuery({ query: FETCH_VACATION_REQUESTS, data: { fetchVacationRequests } });
    }}
    onCompleted={() => props.close()}>
    {(mutate, { loading, error }) => (
      <PopupBase
        buttonStyles={{ justifyContent: "space-between" }}
        close={() => props.close()}
        small={true}>
        <h1>Decide Vacation request</h1>
        <div>
          Do you really want to {props.decission} <UserName unitid={props.id} />
          's vacation request?
        </div>

        <ErrorComp error={error} />

        <UniversalButton
          label="cancel"
          disabled={loading}
          type="low"
          onClick={() => props.close()}
        />
        <UniversalButton
          disabled={loading}
          onClick={() => {
            mutate({ variables: { userid: props.id, requestid: props.requestID } });
          }}
          label="Confirm"
          type="high"
        />
      </PopupBase>
    )}
  </Mutation>
);
