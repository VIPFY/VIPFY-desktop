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
  handleError?: Function;
}

interface State {
  values: Object;
  save: Boolean;
}

class FormPopup extends React.Component<Props, State> {
  state = { values: {}, save: false };

  listenKeyboard = e => {
    const fields = this.props.fields;
    const idlist: Array<string> = [];
    var idcheck = false;
    if (fields) {
      fields.forEach(field => {
        idlist.push(field.id);
      });
    } else {
      idcheck = true;
    }
    if (e.target && e.target.id && idlist.includes(e.target.id)) {
      idcheck = true;
    }
    if (e.key === "Escape" || e.keyCode === 27) {
      this.setState({ values: {} });
      this.props.close();
    } else if (
      idcheck &&
      (e.key === "Enter" || e.keyCode === 13) &&
      !(this.props.submitDisabled && this.props.submitDisabled(this.state.values))
    ) {
      this.setState({ save: true });
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
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
            close("user");
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
            closeFunction={action => close(action)}
            handleError={this.props.handleError}
          />
        )}
      </PopupBase>
    );
  }
}
export default FormPopup;
