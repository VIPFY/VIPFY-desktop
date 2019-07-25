import * as React from "react";
import { countries } from "../../constants/countries";

interface Props {
  id: string;
  livevalue?: Function;
  endvalue?: Function;
  label?: string;
  type?: string;
  errorEvaluation?: Boolean;
  errorhint?: string;
  startvalue?: string;
  width?: string;
  livecode?: Function;
  noresults?: string;
}

interface State {
  value: string;
  error: string | null;
  inputFocus: Boolean;
  eyeopen: Boolean;
  notypeing: Boolean;
  errorfaded: Boolean;
  code: string;
}

class UniversalDropDownInput extends React.Component<Props, State> {
  state = {
    value:
      this.props.startvalue && countries.find(c => c.code == this.props.startvalue)
        ? countries.find(c => c.code == this.props.startvalue).name
        : "",
    error: null,
    inputFocus: false,
    eyeopen: false,
    notypeing: true,
    errorfaded: false,
    code: this.props.startvalue || ""
  };

  componentWillReceiveProps = props => {
    setTimeout(() => this.setState({ errorfaded: props.errorEvaluation }), 1);
  };

  toggleInput = bool => {
    // If only one result - take it.
    const possibleValues = countries;
    if (
      possibleValues.filter(i => i.name.toLowerCase() == this.state.value.toLowerCase()).length == 1
    ) {
      this.selectResult(
        possibleValues.filter(i => i.name.toLowerCase() == this.state.value.toLowerCase())[0]
      );
    } else {
      this.setState({ inputFocus: bool });
    }
    if (!bool && this.props.endvalue) {
      this.setState({ error: null });
      this.props.endvalue(this.state.value);
    }
    if (!bool) {
      this.setState({ notypeing: true });
      clearTimeout(this.timeout);
    }
  };

  changeValue(e) {
    e.preventDefault();
    clearTimeout(this.timeout);
    if (this.props.livevalue) {
      this.props.livevalue(e.target.value);
    }
    if (this.props.livecode) {
      this.props.livecode("");
    }

    this.setState({ value: e.target.value, notypeing: false, code: "" });
    this.timeout = setTimeout(() => this.setState({ notypeing: true }), 250);
  }

  showResults = () => {
    const possibleValues = countries;
    let numresults = 0;
    let results: JSX.Element[] = [];
    if (this.state.value != "") {
      for (let i = 0; i < possibleValues.length; i++) {
        if (
          numresults < 5 &&
          //possibleValues[i].name.toLowerCase().includes(this.state.value.toLowerCase()) &&
          possibleValues[i].name.toLowerCase().startsWith(this.state.value.toLowerCase())
        ) {
          //let index = possibleValues[i].name.toLowerCase().indexOf(this.state.value.toLowerCase());
          let index = 0;
          results.push(
            <div
              key={`searchResult-${i}`}
              className="searchResult"
              onClick={() => this.selectResult(possibleValues[i])}>
              <span>{possibleValues[i].name.substring(0, index)}</span>
              <span className="resultHighlight">
                {possibleValues[i].name.substring(index, index + this.state.value.length)}
              </span>
              <span>{possibleValues[i].name.substring(index + this.state.value.length)}</span>
            </div>
          );
          numresults++;
        }
      }
      return (
        <React.Fragment>
          <div style={{ width: "355px", height: "10px", position: "relative" }} />
          <div className="resultHolder">
            {numresults == 0 ? (
              <div className="searchResult">
                <span>{this.props.noresults || "No results"}</span>
              </div>
            ) : (
              results
            )}
          </div>
        </React.Fragment>
      );
    }
  };

  selectResult = value => {
    if (this.props.livecode) {
      this.props.livecode(value.code);
    }
    this.setState({ value: value.name, code: value.code });
  };

  render() {
    return (
      <div
        className="universalLabelInput"
        style={this.props.width ? { width: this.props.width } : {}}>
        <input
          id={this.props.id}
          type={
            this.props.type == "password"
              ? this.state.eyeopen
                ? ""
                : "password"
              : this.props.type || ""
          }
          onFocus={() => this.toggleInput(true)}
          onBlur={() => this.toggleInput(false)}
          className="cleanup universalTextInput"
          style={
            this.props.errorEvaluation && this.state.notypeing
              ? { ...(this.props.width ? { width: this.props.width } : {}), color: "#e32022" }
              : this.props.width
              ? { width: this.props.width }
              : {}
          }
          value={this.state.value}
          onChange={e => this.changeValue(e)}
          ref={input => {
            this.nameInput = input;
          }}
        />
        <label
          htmlFor={this.props.id}
          className="universalLabel"
          style={this.props.errorEvaluation && this.state.notypeing ? { color: "#e32022" } : {}}>
          {this.props.label}
        </label>
        {this.props.errorEvaluation && this.state.notypeing ? (
          <div className="errorhint" style={{ opacity: this.state.errorfaded ? 1 : 0 }}>
            {this.props.errorhint}
          </div>
        ) : (
          ""
        )}
        {this.state.code == "" ? this.showResults() : ""}
        {this.props.children ? (
          <button className="cleanup inputInsideButton" tabIndex={-1}>
            <i className="fal fa-info" />
            <div className="explainLayer">
              <div className="explainLayerInner">{this.props.children}</div>
            </div>
          </button>
        ) : (
          ""
        )}
        {this.props.type == "password" ? (
          this.state.eyeopen ? (
            <button
              className="cleanup inputInsideButton"
              tabIndex={-1}
              onClick={() => this.setState({ eyeopen: false })}>
              <i className="fal fa-eye" />
            </button>
          ) : (
            <button
              className="cleanup inputInsideButton"
              tabIndex={-1}
              onClick={() => this.setState({ eyeopen: true })}>
              <i className="fal fa-eye-slash" />
            </button>
          )
        ) : (
          ""
        )}
      </div>
    );
  }
}
export default UniversalDropDownInput;
