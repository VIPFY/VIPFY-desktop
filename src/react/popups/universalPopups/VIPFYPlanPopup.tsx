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
import { SET_VAT_ID } from "../../mutations/department";

const SELECT_VIPFY_PLAN = gql`
  mutation onSelectVIPFYPlan($planid: ID!, $tos: Boolean!) {
    selectVIPFYPlan(planid: $planid, tos: $tos)
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
  currentPlan: Expired_Plan;
  close?: Function;
  headline?: string;
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
  const [step, setStep] = React.useState(0);
  const [tos, toggleTos] = React.useState(false);
  const { company, currentPlan } = props;
  console.log("FIRE: company, currentPlan", company, currentPlan);

  return (
    <PopupBase additionalclassName="vipfy-plans-popup" closeable={props.close ? true : false}>
      <h1>{props.headline || "Your VIPFY Plan has expired"}</h1>

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
                {data.fetchVIPFYPlans.map(plan => {
                  const isCurrentPlan = !currentPlan.firstPlan && plan.id == currentPlan.id;

                  return (
                    <React.Fragment key={plan.id}>
                      <input
                        disabled={isCurrentPlan}
                        required
                        id={plan.id}
                        type="radio"
                        name="vipfy-plan"
                      />
                      <VIPFYPlan
                        className={isCurrentPlan ? "vipfy-plan-current" : ""}
                        preferred={Object.keys(plan.payperiod)[0] == "years"}
                        plan={plan}
                        onClick={() => select(plan)}
                        htmlFor={plan.id}
                      />
                    </React.Fragment>
                  );
                })}
              </form>
              {props.close && <UniversalButton type="low" onClick={props.close} label="cancel" />}
              <UniversalButton form="vipfy-plans" type="high" label="select plan" />
            </React.Fragment>
          );

          const SetVat = (
            <Mutation<WorkAround, WorkAround> mutation={SET_VAT_ID} onCompleted={() => setStep(4)}>
              {(mutate, { loading, error }) => (
                <React.Fragment>
                  <p>Please enter your vatnumber</p>
                  <form
                    id="vat-form"
                    onSubmit={e => {
                      e.preventDefault();
                      const vatID = e.target.querySelector("input").value;
                      mutate({ variables: { vatID } });
                    }}>
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
                </React.Fragment>
              )}
            </Mutation>
          );

          const VerifySelection = (
            <Mutation<WorkAround, WorkAround>
              mutation={SELECT_VIPFY_PLAN}
              onCompleted={() => {
                if (props.close) {
                  props.close();
                }
              }}>
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
                    className="float-right"
                    onClick={() => mutate({ variables: { planid: selected.id, tos } })}
                    type="high"
                    label="order"
                  />
                </div>
              )}
            </Mutation>
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
                      return VerifySelection;
                    } else {
                      return SetVat;
                    }
                  }}
                </Query>
              );

            case 3:
              return SetVat;

            case 4:
              return VerifySelection;

            default:
              return PlanSelect;
          }
        }}
      </Query>
    </PopupBase>
  );
};
