import * as React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Expired_Plan, WorkAround } from "../../interfaces";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";
import VIPFYPlan from "../../common/VIPFYPlan";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import { shell } from "electron";
import { FETCH_CARDS } from "../../queries/billing";
import StripeForm from "../../components/billing/StripeForm";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import { SET_VAT_ID } from "../../mutations/department";

const SELECT_VIPFY_PLAN = gql`
  mutation onSelectVIPFYPlan($planid: ID!) {
    selectVIPFYPlan(planid: $planid)
  }
`;

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
  company: {
    unit: { id: string };
    profilepicture?: string;
    employees: number;
    name?: string;
    setupFinished: boolean;
    legalinformation: { vatID: string; [moreProps: string]: any };
  };
}

export default (props: Props) => {
  const [selected, select] = React.useState(null);
  const [step, setStep] = React.useState(1);
  const [tos, toggleTos] = React.useState(false);
  console.log("FIRE: props", props);

  const { company } = props;

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

          const PlanSelect = (
            <React.Fragment>
              <p>Please select a new Plan</p>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setStep(2);
                }}
                id="vipfy-plans">
                {data.fetchVIPFYPlans.map(plan => (
                  <React.Fragment key={plan.id}>
                    <input required id={plan.id} type="radio" name="vipfy-plan" />
                    <VIPFYPlan
                      preferred={Object.keys(plan.payperiod)[0] == "years"}
                      plan={plan}
                      onClick={() => select(plan)}
                      htmlFor={plan.id}
                    />
                  </React.Fragment>
                ))}
              </form>
              <UniversalButton form="vipfy-plans" type="high" label="select plan" />
            </React.Fragment>
          );

          switch (step) {
            case 1:
              return PlanSelect;

            case 2:
              return (
                <Query<WorkAround, WorkAround> query={FETCH_CARDS}>
                  {({ data, loading, error }) => {
                    if (loading) {
                      return <LoadingDiv />;
                    }

                    if (error) {
                      return <ErrorComp error={error} />;
                    }

                    const hasVat = company.legalinformation && company.legalinformation.vatID;
                    if (!data || data.fetchPaymentData.length < 1) {
                      return (
                        <StripeForm
                          departmentid={company.unit.id}
                          hasCard={false}
                          onClose={() => setStep(hasVat ? 4 : 3)}
                        />
                      );
                    }

                    if (hasVat) {
                      setStep(4);
                    } else {
                      setStep(3);
                    }
                  }}
                </Query>
              );

            case 3:
              return (
                <Mutation<WorkAround, WorkAround>
                  mutation={SET_VAT_ID}
                  onCompleted={() => setStep(4)}>
                  {(mutate, { loading, error }) => (
                    <form
                      id="vat-form"
                      onSubmit={e => {
                        e.preventDefault();
                        const vatID = e.target.querySelector("input").value;
                        mutate({ variables: { vatID } });
                      }}>
                      <p>Please enter your vatnumber</p>
                      <input
                        title="A vat number has this format FR2234234"
                        className="universalTextInput"
                        pattern="(^[A-Z]{2})([A-Z0-9 ]{2,16})"
                        required
                        placeholder="Your vatnumber"
                      />
                      <ErrorComp error={error} />
                      <UniversalButton disabled={loading} type="high" label="Add" form="vat-form" />
                    </form>
                  )}
                </Mutation>
              );

            case 4:
              return (
                <Mutation<WorkAround, WorkAround>
                  mutation={SELECT_VIPFY_PLAN}
                  onCompleted={() => setStep(2)}>
                  {(mutate, { loading, error }) => (
                    <div className="vipfy-plan-confirmation">
                      <p>{`Please confirm selection of the ${selected.name} plan`}</p>
                      <VIPFYPlan plan={selected} />
                      <UniversalCheckbox name="tos" liveValue={value => toggleTos(value)}>
                        <span style={{ lineHeight: "18px" }}>
                          I agree to the{" "}
                          <span
                            style={{ color: "#20BAA9" }}
                            className="fancy-link"
                            onClick={() => shell.openExternal("https://vipfy.store/tos")}>
                            Terms of Service
                          </span>{" "}
                          of VIPFY.
                        </span>
                      </UniversalCheckbox>
                      <p className="legal-notice">{`By clicking the order button you agree to a contract between ${
                        company.name
                      } and VIPFY GmbH. The resulting subscription can be cancelled every ${
                        selected.cancelperiod[Object.keys(selected.cancelperiod)[0]]
                      } ${Object.keys(
                        selected.cancelperiod
                      )}. We will use the chosen payment method in your account to deduct the amount of money.`}</p>
                      <ErrorComp error={error} />
                      <UniversalButton type="low" label="go back" onClick={() => setStep(1)} />
                      <UniversalButton
                        disabled={!tos || loading}
                        onClick={() => mutate({ variables: { planid: selected.id } })}
                        type="high"
                        label="order"
                      />
                    </div>
                  )}
                </Mutation>
              );

            case 5:
              return <div>Congrats</div>;

            default:
              return PlanSelect;
          }
        }}
      </Query>
    </PopupBase>
  );
};
