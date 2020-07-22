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
  styles?: Object;
}

export default (props: Props) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    setValue(props.value);
  }, [props]);

  return (
    <div className={`textarea-wrapper ${props.wrapperClass}`} style={props.styles || {}}>
      <textarea
        id="universal-textarea"
        cols={54}
        rows={10}
        onChange={e => {
          props.handleChange(e.target.value);
          setValue(e.target.value);
        }}
        {...props}
        value={value}
      />
      <label htmlFor="universal-textarea">{props.label}</label>
    </div>
  );
};
