import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalTextInput from "../../components/universalForms/universalTextInput";

interface Props {
  key: string;
  heading: string;
  subHeading?: string;
  fields: { id: string; options: any }[];
  close: Function;
  nooutsideclose?: boolean;
  submit: Function;
  submitDisabled?: Function;
}

interface State {
  values: Object;
}

class FormPopup extends React.Component<Props, State> {
  state = { values: {} };

  render() {
    const {
      heading,
      subHeading,
      fields,
      close,
      nooutsideclose,
      submit,
      key,
      submitDisabled
    } = this.props;
    console.log("PopupFields", this.state, this.props);
    return (
      <PopupBase
        nooutsideclose={nooutsideclose}
        small={true}
        key={key}
        close={close}
        additionalclassName="formPopup">
        <h1>{heading}</h1>
        {subHeading && <h2>{subHeading}</h2>}
        {fields &&
          fields.map(field => (
            <UniversalTextInput
              id={field.id}
              {...field.options}
              livevalue={v => {
                this.setState(oldstate => ({ ...oldstate, [field.id]: v }));
              }}
              width="100%"
            />
          ))}
        <UniversalButton
          type="low"
          onClick={() => {
            this.setState({ values: {} });
            close();
          }}
          label="Cancel"
        />
        <UniversalButton
          type="high"
          disabled={submitDisabled && submitDisabled(this.state.values)}
          label="Confirm"
          onClick={() => submit(this.state.values)}
        />
      </PopupBase>
    );
  }
}
export default FormPopup;
