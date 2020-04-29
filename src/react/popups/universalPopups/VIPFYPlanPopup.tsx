import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Expired_Plan, WorkAround } from "../../interfaces";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";
import VIPFYPlan from "../../common/VIPFYPlan";

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
      payperiod
      cancelperiod
      options
    }
  }
`;

interface Props {
  close: Function;
  plan: Expired_Plan;
}

export default (props: Props) => {
  const [selected, select] = React.useState(null);
  const [step, setStep] = React.useState(0);
  console.log("FIRE: props", props);

  const selectPlan = e => {
    e.preventDefault();
    setStep(1);
  };

  return (
    <PopupBase additionalclassName="vipfy-plans-popup" closeable={false}>
      <h1>Your VIPFY Plan has expired</h1>

      <Query<WorkAround, WorkAround> query={FETCH_VIPFY_PLANS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data) {
            return <ErrorComp error={error} />;
          }

          switch (step) {
            case 1:
              return (
                <React.Fragment>
                  <p>{`Please confirm selection of the ${selected.name} plan`}</p>
                  <VIPFYPlan plan={selected} />
                  <UniversalButton
                    onClick={() => setStep(2)}
                    type="high"
                    label="confirm subscription"
                  />
                </React.Fragment>
              );

            case 2:
              return <div>congrats</div>;

            default:
              return (
                <React.Fragment>
                  <p>Please select a new Plan</p>
                  <form onSubmit={selectPlan} id="vipfy-plans">
                    {data.fetchVIPFYPlans.map(plan => (
                      <React.Fragment key={plan.id}>
                        <input required id={plan.id} type="radio" name="vipfy-plan" />
                        <VIPFYPlan plan={plan} onClick={() => select(plan)} htmlFor={plan.id} />
                      </React.Fragment>
                    ))}
                  </form>
                  <UniversalButton form="vipfy-plans" type="high" label="select plan" />
                </React.Fragment>
              );
          }
        }}
      </Query>
    </PopupBase>
  );
};
