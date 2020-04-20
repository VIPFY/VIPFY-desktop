import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";

interface Props {
  close: Function;
}

export default (props: Props) => {
  return (
    <PopupBase small={true} closeable={false}>
      <h1>Your VIPFY Plan has expired</h1>
      <p>Please select a new Plan</p>

      <UniversalButton type="high" onClick={props.close} label="close" />
    </PopupBase>
  );
};
