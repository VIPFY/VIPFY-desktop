import * as React from "react";

interface Props {
  onClick?: Function;
  htmlFor?: string;
  preferred?: boolean;
  plan: {
    name: string;
    options: {
      [prop: string]: any;
    };
    payperiod: string;
    [prop: string]: any;
  };
}

export default (props: Props) => {
  const { plan } = props;

  return (
    <label
      className="vipfy-plan"
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
      htmlFor={props.htmlFor}>
      <h2>{plan.name}</h2>
      <div className="text-container">
        {Object.keys(plan.options).map(option => (
          <p key={option}>{`${option}: ${plan.options[option] || "Unlimited"}`}</p>
        ))}
      </div>
      <div className="price-container">
        <b>{plan.price}</b>
        <p>
          Per User /{" "}
          <span>
            {Object.keys(plan.payperiod)[0].substring(0, Object.keys(plan.payperiod)[0].length - 1)}
          </span>
        </p>
      </div>
      {props.preferred && <div className="preferred">You save 6 € per User / Year!</div>}
    </label>
  );
};
