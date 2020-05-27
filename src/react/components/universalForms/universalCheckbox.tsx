import * as React from "react";

interface Props {
  startingvalue?: any;
  name?: string;
  style?: object;
  liveValue: Function;
  disabled?: boolean;
}

export default (props: Props) => {
  const [value, setValue] = React.useState(props.startingvalue || false);

  return (
    <div className="generic-checkbox-holder" style={props.style || {}}>
      <input
        type="checkbox"
        disabled={props.disabled}
        className="cool-checkbox"
        id={`cool-checkbox-${props.name}`}
        checked={value == true}
        name={props.name}
        onChange={e => {
          setValue(e.target.checked);
          props.liveValue(e.target.checked);
        }}
      />
      <label htmlFor={`cool-checkbox-${props.name}`} className="generic-form-checkbox">
        <div className={value ? "checkboxSquareActive" : "checkboxSquare"}>
          <i className={`fal fa-${value == true ? "check" : "minus"}`} />
        </div>
        {props.children}
      </label>
    </div>
  );
};
