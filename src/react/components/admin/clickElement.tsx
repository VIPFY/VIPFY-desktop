import * as React from "react";
import UniversalDropdown from "../universalForms/universalDropdown";

interface Props {}

interface State {}

class ClickElement extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <div>
        <UniversalDropdown
          options={[
            { value: "waitandfill", label: "Fill Field" },
            { value: "click", label: "click" },
            { value: "wait", label: "Wait" }
          ]}
          dropdownStyles={{ color: "white", width: "100%", height: "32px", fontSize: "16px" }}
          dropdownOptionStyles={{ color: "#253647" }}
          width="100%"
          allowOther={true}
          label="Operation"
          style={{ color: "white" }}
          trashstyle={{ color: "white" }}
          labelstyle={{ color: "white" }}
          livevalue={e => console.log(e)}></UniversalDropdown>
      </div>
    );
  }
}

export default ClickElement;
