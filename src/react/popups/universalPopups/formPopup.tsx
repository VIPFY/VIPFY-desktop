import * as React from "react";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import UniversalTextInput from "../../components/universalForms/universalTextInput";
import PopupSelfSaving from "./selfSaving";

interface Props {
  key: string;
  heading: string;
  subHeading?: string | JSX.Element;
  fields: { id: string; options: any }[];
  close: Function;
  nooutsideclose?: boolean;
  submit: Function;
  submitDisabled?: Function;
  savingHeading?: string;
  explainImage?: JSX.Element;
  cancelLabel?: string;
  confirmLabel?: string;
  addStyles?: Object;
}

interface State {
  values: Object;
  save: Boolean;
}

class FormPopup extends React.Component<Props, State> {
  state = { values: {}, save: false };

  componentWillUnmount() {
    this.setState({ values: {}, save: false });
  }

  render() {
    const {
      heading,
      subHeading,
      fields,
      close,
      nooutsideclose,
      submit,
      key,
      submitDisabled,
      savingHeading,
      explainImage,
      cancelLabel,
      confirmLabel,
      addStyles
    } = this.props;
    return (
      <PopupBase
        nooutsideclose={nooutsideclose}
        small={true}
        close={close}
        additionalclassName="formPopup"
        styles={addStyles}>
        <h1>{heading}</h1>
        {subHeading && <h2>{subHeading}</h2>}
        {explainImage && (
          <div style={{ marginBottom: "36px", display: "flex", justifyContent: "center" }}>
            {explainImage}
          </div>
        )}
        {fields &&
          fields.map(field => (
            <UniversalTextInput
              key={field.id}
              id={field.id}
              {...field.options}
              livevalue={v => {
                this.setState(oldstate => ({
                  values: { ...oldstate.values, [field.id]: v }
                }));
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
          label={cancelLabel || "Cancel"}
        />
        <UniversalButton
          type="high"
          disabled={submitDisabled && submitDisabled(this.state.values)}
          label={confirmLabel || "Confirm"}
          onClick={() => this.setState({ save: true })}
        />
        {this.state.save && (
          <PopupSelfSaving
            saveFunction={async () => await submit(this.state.values)}
            heading={savingHeading || "Process Data"}
            closeFunction={() => close()}
          />
        )}
      </PopupBase>
    );
  }
}
export default FormPopup;
