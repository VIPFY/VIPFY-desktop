import * as React from "react";
import UniversalDropdown from "../universalForms/universalDropdown";

interface Props {
  startvalue: string;
  isLogin: boolean;
  id: string;
  onChange: Function;
}

interface State {
  operation: string;
  dataConnection: string;
}

class ClickElement extends React.Component<Props, State> {
  state = {
    operation: this.props.startvalue,
    dataConnection: ""
  };

  giveOperationOptions() {
    if (this.props.isLogin) {
      return [
        { value: "waitandfill", label: "Fill Field" },
        { value: "click", label: "click" },
        { value: "wait", label: "Wait" },
        { value: "recaptcha", label: "Recaptcha" }
      ];
    } else {
      return [
        { value: "waitandfill", label: "Fill Field" },
        { value: "click", label: "Click" },
        { value: "wait", label: "Wait" },
        { value: "recaptcha", label: "Recaptcha" },
        { value: "repeatFill", label: "Repeat a filled field" }
      ];
    }
  }

  giveFillfieldOptions() {
    if (this.props.isLogin) {
      return [
        { value: "domain", label: "Domain" },
        { value: "email", label: "Email" },
        { value: "username", label: "Username" },
        { value: "password", label: "Password" }
      ];
    } else {
      return [
        { value: "domain", label: "Domain" },
        { value: "email", label: "Email" },
        { value: "username", label: "Username" },
        { value: "password", label: "Password" },
        { value: "firstName", label: "First Name" },
        { value: "lastName", label: "Last Name" },
        { value: "companyName", label: "Company Name" }
      ];
    }
  }

  render() {
    return (
      <div>
        <UniversalDropdown
          id={this.props.id}
          options={this.giveOperationOptions()}
          dropdownStyles={{ color: "white", width: "100%", height: "32px", fontSize: "16px" }}
          dropdownOptionStyles={{ color: "#253647" }}
          width="100%"
          allowOther={true}
          label="Operation"
          style={{ color: "white" }}
          trashstyle={{ color: "white" }}
          labelstyle={{ color: "white" }}
          livevalue={e => {
            this.setState({ operation: e });
            this.props.onChange("operation", e);
          }}
          startvalue={this.state.operation}></UniversalDropdown>
        {(this.state.operation == "waitandfill" || this.state.operation == "repeatFill") && (
          <>
            <div style={{ width: "100%", height: "16px" }}></div>
            <UniversalDropdown
              id={`${this.props.id}-waf`}
              options={this.giveFillfieldOptions()}
              dropdownStyles={{ color: "white", width: "100%", height: "32px", fontSize: "16px" }}
              dropdownOptionStyles={{ color: "#253647" }}
              width="100%"
              allowOther={true}
              label="data-connection"
              style={{ color: "white" }}
              trashstyle={{ color: "white" }}
              labelstyle={{ color: "white" }}
              livevalue={e => {
                this.setState({ dataConnection: e });
                this.props.onChange("fillkey", e);
              }}></UniversalDropdown>
          </>
        )}
      </div>
    );
  }
}

export default ClickElement;
