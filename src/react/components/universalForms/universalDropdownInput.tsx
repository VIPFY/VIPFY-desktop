import * as React from "react";
import { countries } from "../../constants/countries";
import UniversalButton from "../universalButtons/universalButton";

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
  options?: any[];
  codeFunction?: Function;
  renderOption?: Function;
  noFloating?: Boolean;
  resetPossible?: Boolean;
  alternativeText?: Function;
  showIcon?: Function;
  noresultsClick?: Function;
  fewResults?: Boolean;
  nameFunction?: Function;
  styles?: Object;
  noNoResults?: Boolean;
  noFixed?: Boolean;
  disabled?: boolean;
  startingfocus?: boolean;
}

interface State {
  value: string;
  error: string | null;
  inputFocus: Boolean;
  eyeopen: Boolean;
  notypeing: Boolean;
  errorfaded: Boolean;
  code: string;
  fullvalue: any;
}

class UniversalDropDownInput extends React.Component<Props, State> {
  nameFunction = this.props.nameFunction || (v => v.name);

  state = {
    value:
      this.props.startvalue && this.props.options
        ? this.props.options!.find(c =>
            this.props.codeFunction
              ? this.props.codeFunction(c) == this.props.startvalue
              : c.code == this.props.startvalue
          )
          ? this.nameFunction(
              this.props.options!.find(c =>
                this.props.codeFunction
                  ? this.props.codeFunction(c) == this.props.startvalue
                  : c.code == this.props.startvalue
              )
            )
          : ""
        : countries.find(c => c.code == this.props.startvalue)
        ? countries.find(c => c.code == this.props.startvalue)!.name
        : "",
    error: null,
    inputFocus: false,
    eyeopen: false,
    notypeing: true,
    errorfaded: false,
    code: this.props.startvalue || "",
    fullvalue:
      this.props.startvalue && this.props.options
        ? this.props.options!.find(c =>
            this.props.codeFunction
              ? this.props.codeFunction(c) == this.props.startvalue
              : c.code == this.props.startvalue
          )
          ? this.props.options!.find(c =>
              this.props.codeFunction
                ? this.props.codeFunction(c) == this.props.startvalue
                : c.code == this.props.startvalue
            )
          : null
        : null
  };

  UNSAFE_componentWillReceiveProps = props => {
    setTimeout(() => this.setState({ errorfaded: props.errorEvaluation }), 1);
  };

  componentDidMount() {
    if (this.props.startvalue && this.props.livecode) {
      this.props.livecode(this.props.startvalue);
    }
    if (this.nameInput && this.props.startingfocus) {
      this.nameInput.focus();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.startvalue != this.props.startvalue || prevProps.id != this.props.id) {
      this.setState({
        code: this.props.startvalue || "",
        value: this.props.options
          ? this.props.options!.find(c =>
              this.props.codeFunction
                ? this.props.codeFunction(c) == this.props.startvalue
                : c.code == this.props.startvalue
            )
            ? this.nameFunction(
                this.props.options!.find(c =>
                  this.props.codeFunction
                    ? this.props.codeFunction(c) == this.props.startvalue
                    : c.code == this.props.startvalue
                )
              )
            : ""
          : "",
        fullvalue: this.props.options
          ? this.props.options!.find(c =>
              this.props.codeFunction
                ? this.props.codeFunction(c) == this.props.startvalue
                : c.code == this.props.startvalue
            )
            ? this.props.options!.find(c =>
                this.props.codeFunction
                  ? this.props.codeFunction(c) == this.props.startvalue
                  : c.code == this.props.startvalue
              )
            : null
          : null
      });
    }
  }

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

    this.setState({ value: e.target.value, notypeing: false, code: "", fullvalue: null });
    this.timeout = setTimeout(() => this.setState({ notypeing: true }), 250);
  }

  reset() {
    if (this.props.livevalue) {
      this.props.livevalue("");
    }
    if (this.props.livecode) {
      this.props.livecode("");
    }

    this.setState({ value: "", code: "", fullvalue: null });
    this.nameInput.focus();
  }

  showResults = () => {
    const possibleValues = this.props.options || countries;
    let numresults = 0;
    let results: JSX.Element[] = [];
    if (this.state.value != "") {
      for (let i = 0; i < possibleValues.length; i++) {
        if (
          numresults < 5 &&
          //possibleValues[i].name.toLowerCase().includes(this.state.value.toLowerCase()) &&
          this.nameFunction(possibleValues[i])
            .toLowerCase()
            .startsWith(this.state.value.toLowerCase())
        ) {
          //let index = possibleValues[i].name.toLowerCase().indexOf(this.state.value.toLowerCase());
          let index = 0;
          results.push(
            this.props.renderOption ? (
              this.props.renderOption(
                possibleValues,
                i,
                v => this.selectResult(v),
                this.state.value
              )
            ) : (
              <div
                key={`searchResult-${i}`}
                className="searchResult"
                onClick={() => this.selectResult(possibleValues[i])}>
                <span>{this.nameFunction(possibleValues[i]).substring(0, index)}</span>
                <span className="resultHighlight">
                  {this.nameFunction(possibleValues[i]).substring(
                    index,
                    index + this.state.value.length
                  )}
                </span>
                <span>
                  {this.nameFunction(possibleValues[i]).substring(index + this.state.value.length)}
                </span>
              </div>
            )
          );
          numresults++;
        }
        if (numresults >= 5) {
          break;
        }
      }
      if (numresults < 5 && !this.props.noNoResults) {
        results.push(
          <div
            className="searchResult"
            onClick={() =>
              this.props.noresultsClick && this.props.noresultsClick(this.state.value)
            }>
            <span>{this.props.noresults || "No results"}</span>
          </div>
        );
      }
      return (
        <React.Fragment>
          <div
            className="resultHolder"
            style={
              this.props.noFixed
                ? { marginTop: "35px", width: this.props.width || "400px" }
                : { marginTop: "35px", position: "fixed", width: this.props.width || "400px" }
            }>
            {numresults == 0 ? (
              <div
                className="searchResult"
                onClick={() =>
                  this.props.noresultsClick && this.props.noresultsClick(this.state.value)
                }>
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
    let code = value.code;
    if (this.props.codeFunction) {
      code = this.props.codeFunction(value);
    }
    if (this.props.livecode) {
      this.props.livecode(code);
    }
    this.setState({ value: this.nameFunction(value), code: code, fullvalue: value });
  };

  render() {
    if (this.props.options && this.props.options.length == 0 && this.props.noresultsClick) {
      return (
        <div style={{ width: "calc(100% - 84px)" }}>
          <UniversalButton
            onClick={() => this.props.noresultsClick!()}
            label={this.props.noresults || "No results"}
            type="high"
          />
        </div>
      );
    }
    return (
      <div
        className={`textField ${this.props.disabled ? "disabled" : ""}`}
        style={Object.assign(
          { textAlign: "left" },
          this.props.width ? { width: this.props.width } : {},
          this.props.holderStyles || {}
        )}>
        {this.props.label && (
          <label
            htmlFor={this.props.id}
            className="universalLabel"
            style={Object.assign(
              (this.props.errorEvaluation ||
                (this.props.required && this.state.value == "" && !this.state.inputFocus)) &&
                this.state.notypeing
                ? { color: "#e32022" }
                : {},
              this.props.labelStyles || {}
            )}
            onClick={() => this.props.labelClick && this.props.labelClick()}>
            {this.props.label}
          </label>
        )}
        <div
          className="universalLabelInput"
          style={Object.assign(
            { height: "30px", position: "relative" },
            this.props.width ? { width: this.props.width } : {},
            this.props.styles || {}
          )}>
          <input
            id={this.props.id}
            disabled={this.props.disabled}
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
            style={{
              ...(this.props.errorEvaluation && this.state.notypeing
                ? { ...(this.props.width ? { width: this.props.width } : {}), color: "#e32022" }
                : this.props.width
                ? { width: this.props.width }
                : {}),
              ...(this.props.showIcon && this.state.code != ""
                ? {
                    paddingLeft: "32px",
                    width: this.props.width
                      ? parseInt(this.props.width) - 32 + "px"
                      : "calc(100% - 32px)"
                  }
                : {})
            }}
            value={this.state.value}
            onChange={e => this.changeValue(e)}
            ref={input => (this.nameInput = input)}
          />
          {this.props.errorEvaluation && this.state.notypeing && (
            <div className="errorhint" style={{ opacity: this.state.errorfaded ? 1 : 0 }}>
              {this.props.errorhint}
            </div>
          )}
          {this.state.code == "" && this.showResults()}
          {this.state.code != "" &&
            this.props.showIcon &&
            this.props.showIcon(this.state.fullvalue)}
          {this.props.children && (
            <button className="cleanup inputInsideButton" tabIndex={-1}>
              <i className="fal fa-info" />
              <div className="explainLayer">
                <div className="explainLayerInner">{this.props.children}</div>
              </div>
            </button>
          )}
          {this.props.resetPossible && this.state.value && (
            <button
              className="cleanup inputInsideButton"
              tabIndex={-1}
              onClick={() => this.reset()}
              style={{ color: "#253647" }}>
              <i className="fal fa-trash-alt" />
            </button>
          )}
          {!this.state.value &&
            this.props.alternativeText &&
            this.props.alternativeText(this.nameInput)}
          {this.props.type == "password" &&
            (this.state.eyeopen ? (
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
            ))}
        </div>
      </div>
    );
  }
}

export default UniversalDropDownInput;
