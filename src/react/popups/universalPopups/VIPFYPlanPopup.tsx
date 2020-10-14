import * as React from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import gql from "graphql-tag";
import { shell } from "electron";
import moment from "moment";
import { Checkbox, Link } from "@vipfy-private/vipfy-ui-lib";

import { ErrorComp } from "../../common/functions";
import VIPFYPlan from "../../common/VIPFYPlan";
import StripeForm from "../../components/billing/StripeForm";
import LoadingDiv from "../../components/LoadingDiv";
import UniversalButton from "../../components/universalButtons/universalButton";
import { Expired_Plan, WorkAround } from "../../interfaces";
import { SET_VAT_ID } from "../../mutations/department";
import { FETCH_CARDS } from "../../queries/billing";
import PopupBase from "./popupBase";

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

  const calculateEndtime = () => {
    let endtime;

    if (currentPlan.endtime) {
      endtime = moment(currentPlan.endtime);
    } else {
      const [periodAmount, period] = currentPlan.cancelperiod.split(" ");
      endtime = moment().add(periodAmount, `${period}s`);

      return endtime.add(1, "month").startOf("month").format("LL");
    }
  };

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
              <p>Please select a new plan</p>
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
              {(mutate, { loading: l3, error: e3 }) => (
                <React.Fragment>
                  <p>Please enter your VAT number</p>
                  <form
                    id="vat-form"
                    onSubmit={e => {
                      e.preventDefault();
                      const vatID = e.target.querySelector("input").value;
                      mutate({ variables: { vatID } });
                    }}>
                    <input
                      title="A VAT number has this format: FR2234234"
                      className="universalTextInput"
                      pattern="(^[A-Z]{2})([A-Z0-9 ]{2,16})"
                      required
                      placeholder="Your VAT number"
                    />
                    <ErrorComp error={e3} />
                    <UniversalButton disabled={l3} type="high" label="Add" form="vat-form" />
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
              {(mutate, { data: d2, loading: l2, error: e2 }) => (
                <div className="vipfy-plan-confirmation">
                  <p>{`Please confirm selection of the ${selected.name} plan`}</p>
                  <VIPFYPlan plan={selected} />

                  {!currentPlan.firstPlan && (
                    <div className="vipfy-plan-notice">
                      Your new plan will start on <b>{calculateEndtime()}</b>. Until then your
                      current plan will remain active.
                    </div>
                  )}

                  {selected.price !== 0 && (
                    <div className="vipfy-plan-notice">
                      {`Currently there ${company.employees > 1 ? "are" : "is"} ${
                        company.employees
                      } user${
                        company.employees > 1 ? "s" : ""
                      } in this company. You will pay a total of `}
                      <b>
                        {selected.price * company.employees} {selected.currency} per{" "}
                        {Object.keys(selected.payperiod)[0].substring(
                          0,
                          Object.keys(selected.payperiod)[0].length - 1
                        )}
                      </b>
                      .
                    </div>
                  )}

                  <div className="tosAgreement">
                    <Checkbox
                      title="Terms of service agreement"
                      name="tos"
                      handleChange={value => toggleTos(value)}>
                      <span className="agreementText">I agree to the</span>
                    </Checkbox>
                    <Link
                      label="VIPFY Terms of Service"
                      className="cta agreementText"
                      onClick={() => shell.openExternal("https://vipfy.store/tos")}
                    />
                  </div>

                  <p className="legal-notice">{`By clicking the order button you agree to a contract between ${
                    company.name
                  } and VIPFY GmbH. The resulting subscription can be cancelled every ${
                    selected.cancelperiod[Object.keys(selected.cancelperiod)[0]]
                  } ${Object.keys(
                    selected.cancelperiod
                  )}. We will use the chosen payment method in your account to deduct the amount of money.`}</p>

                  <ErrorComp error={e2} />

                  {d2 && d2.selectVIPFYPlan && (
                    <div className="success">Thank you for selecting a VIPFY plan</div>
                  )}

                  <UniversalButton
                    disabled={l2 || (d2 && d2.selectVIPFYPlan)}
                    type="low"
                    label="go back"
                    onClick={() => setStep(1)}
                  />
                  <UniversalButton
                    disabled={!tos || l2 || (d2 && d2.selectVIPFYPlan)}
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
                  {({ data: d4, loading: l4, error: e4 }) => {
                    if (l4) {
                      return <LoadingDiv />;
                    }

                    if (e4) {
                      return <ErrorComp error={e4} />;
                    }

                    const hasVat = company.legalinformation && company.legalinformation.vatID;

                    if (!d4 || d4.fetchPaymentData.length < 1) {
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
