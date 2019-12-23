import * as React from "react";

interface Props {
  label: string;
  type?: string; //high | low
  disabled?: Boolean;
  onClick?: Function;
  closingPopup?: Boolean;
  closingAllPopups?: Boolean;
  additionalClickFunction?: Function;
  customStyles?: Object;
  form?: string;
  className?: string;
  tabIndex?: number;
}

export default (props: Props) => {
  const [confirmPopup, setPopup] = React.useState(false);

  const click = e => {
    const child = props.children;
    if (!props.disabled) {
      if (
        child &&
        !Array.isArray(child) &&
        child.type &&
        child.type.name.endsWith("ConfirmationPopup")
      ) {
        return setPopup(true);
      }
      if (props.onClick) {
        props.onClick(e);
      }
      if (props.additionalClickFunction) {
        props.additionalClickFunction();
      }
    }
  };

  const printChildren = children => {
    if (children && !Array.isArray(children)) {
      return "";
    } else {
      return "";
    }
  };

  return (
    <React.Fragment>
      <button
        type={props.form ? "submit" : "button"}
        form={props.form}
        className={`cleanup universalCoverButton ${props.className}`}
        onClick={e => click(e)}
        style={props.customStyles ? {} : { width: props.label.length > 6 ? undefined : 90 }}
        tabIndex={props.tabIndex}>
        <div
          className={`cleanup universalButton ${props.type ? props.type : ""} ${
            props.disabled ? "disabled" : "useable"
          }`}
          tabIndex={-1}
          style={props.customStyles ? props.customStyles : {}}>
          {props.label}
        </div>
      </button>
      {printChildren(props.children)}
    </React.Fragment>
  );
};
