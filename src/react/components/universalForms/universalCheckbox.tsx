import * as React from "react";

interface Props {
  startingvalue?: any;
  name?: string;
  style?: object;
  liveValue: Function;
}

interface State {
  value: any;
}

class UniversalCheckbox extends React.Component<Props, State> {
  state = {
    value: this.props.startingvalue || false
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.startingvalue != this.props.startingvalue) {
      this.setState({ value: this.props.startingvalue || false });
    }
  }

  render() {
    return (
      <div className="generic-checkbox-holder" style={this.props.style || {}}>
        <input
          type="checkbox"
          className="cool-checkbox"
          id={`cool-checkbox-${this.props.name}`}
          checked={this.state.value == true}
          name={this.props.name}
          onChange={e => {
            this.setState({ value: e.target.checked });
            this.props.liveValue(e.target.checked);
          }}
        />
        <label htmlFor={`cool-checkbox-${this.props.name}`} className="generic-form-checkbox">
          <div className={this.state.value ? "checkboxSquareActive" : "checkboxSquare"}>
            {this.state.value == true ? (
              <i className="fal fa-check" />
            ) : (
              <i className="fal fa-minus" />
            )}
          </div>
          {/*<svg width="18px" height="18px" viewBox="0 0 18 18">
            <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
            <polyline points="1 9 7 14 15 4" />
        </svg>*/}
          {this.props.children}
        </label>
      </div>
    );
  }
}
export default UniversalCheckbox;
