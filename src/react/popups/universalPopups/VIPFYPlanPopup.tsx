import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Expired_Plan, WorkAround } from "../../interfaces";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";

const FETCH_VIPFY_PLANS = gql`
  {
    fetchVIPFYPlans {
      id
      name
      teaserdescription
      features
      enddate
      price
      currency
      options
    }
  }
`;

interface Props {
  close: Function;
  plan: Expired_Plan;
}

export default (props: Props) => {
  console.log("FIRE: props", props);

  return (
    <PopupBase small={true} closeable={false}>
      <h1>Your VIPFY Plan has expired</h1>
      <p>Please select a new Plan</p>

      <Query<WorkAround, WorkAround> query={FETCH_VIPFY_PLANS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data) {
            return <ErrorComp error={error} />;
          }
          console.log("FIRE: data", data);

          return <div>da</div>;
        }}
      </Query>

      <UniversalButton type="high" onClick={props.close} label="close" />
    </PopupBase>
  );
};
