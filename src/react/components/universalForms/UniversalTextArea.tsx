import * as React from "react";

interface Props {
  handleChange: Function;
  label: string;
  cols?: number;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  form?: string;
  wrapperClass?: string;
  textareaClass?: string;
  value?: string;
}

export default (props: Props) => {
  const [value, setValue] = React.useState("");

  return (
    <div className={`textarea-wrapper ${props.wrapperClass}`}>
      <textarea
        id="universal-textarea"
        cols={54}
        rows={10}
        value={value}
        onChange={e => {
          props.handleChange(e.target.value);
          setValue(e.target.value);
        }}
        {...props}
      />
      <label htmlFor="universal-textarea">{props.label}</label>
    </div>
  );
};
