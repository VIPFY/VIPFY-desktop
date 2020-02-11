import * as React from "react";
import UniversalButton from "../components/universalButtons/universalButton";

interface Props {
  handleSubmit: Function;
  seperator?: number;
  fieldNumber: number;
  buttonLabel?: string;
  buttonStyles?: object;
  disabled?: boolean;
}

interface State {
  1: number | string;
  2: number | string;
  3: number | string;
  4: number | string;
  5: number | string;
  6: number | string;
}

class TwoFactorForm extends React.Component<Props, State> {
  state = { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "" };

  componentDidMount() {
    document.addEventListener("keydown", this.onEnter, true);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onEnter, true);
  }

  isValid = () => !Object.values(this.state).some(item => item.length == 0);

  onEnter = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
      if (this.isValid()) {
        this.handleSubmit(e);
      }
    } else if (e.key === "Backspace" || e.keyCode === 8) {
      if (document.activeElement.name) {
        this.setState({ [document.activeElement.name]: "" });

        if (document.activeElement.name != 1) {
          this[parseInt(document.activeElement.name) - 1].focus();
        }
      }
    }
  };

  handleChange = e => {
    const name = e.target.name;
    let value = e.target.value;

    if (value.match(/^[\d]+$/g)) {
      if (value.length == 1) {
        this.setState(prevState => ({ ...prevState, [name]: value }));
      } else {
        this.setState(prevState => {
          if (prevState[parseInt(name)] == value[0]) {
            return { ...prevState, [parseInt(name)]: value[1] };
          } else {
            return { ...prevState, [parseInt(name)]: value[0] };
          }
        });
      }

      if (name < 6) {
        this[parseInt(name) + 1].focus();
      }
    }
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.handleSubmit(Object.values(this.state).reduce((acc, cv) => acc + cv));
  };

  mapFields = items =>
    items.map(item => (
      <input
        key={item}
        ref={node => (this[item] = node)}
        onChange={this.handleChange}
        value={this.state[item]}
        required={true}
        name={item}
        type="number"
        min="0"
        max="9"
        step="1"
        form="two-factor-form"
      />
    ));

  render() {
    const first: number[] = [];
    const second: number[] = [];
    const content: any[] = [];

    for (let i = 1; i <= this.props.fieldNumber; i++) {
      if (this.props.seperator && i >= this.props.seperator) {
        second.push(i);
      } else {
        first.push(i);
      }
    }

    content.push(this.mapFields(first));

    if (this.props.seperator) {
      content.push(
        <i className="fal fa-minus" style={{ display: "flex", alignItems: "center" }} />
      );
      content.push(this.mapFields(second));
    }

    return (
      <React.Fragment>
        <form id="two-factor-form" onSubmit={this.handleSubmit}>
          {content}
        </form>

        <UniversalButton
          disabled={!this.isValid() || this.props.disabled}
          label={this.props.buttonLabel ? this.props.buttonLabel : "Continue"}
          type="high"
          customStyles={this.props.buttonStyles}
          onClick={this.handleSubmit}
        />
      </React.Fragment>
    );
  }
}

export default TwoFactorForm;
