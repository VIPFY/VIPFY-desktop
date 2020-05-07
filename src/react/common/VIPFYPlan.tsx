import * as React from "react";

interface Props {
  onClick?: Function;
  htmlFor?: string;
  preferred?: boolean;
  className?: string;
  plan: {
    name: string;
    options: {
      [prop: string]: any;
    };
    payperiod: string;
    cancelperiod: string;
    [prop: string]: any;
  };
}

export default (props: Props) => {
  const { plan } = props;
  const renderPeriod = period =>
    Object.keys(period)[0].substring(0, Object.keys(period)[0].length - 1);

  return (
    <label
      className={`vipfy-plan ${props.className}`}
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
          Per User / <span>{renderPeriod(plan.payperiod)}</span>
        </p>
      </div>
      <div>
        <i>Cancellable on a {renderPeriod(plan.cancelperiod)}ly basis</i>
      </div>
      {props.preferred && <div className="preferred">You save 6 € per User / Year!</div>}
    </label>
  );
};
