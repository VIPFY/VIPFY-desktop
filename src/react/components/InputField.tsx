import * as React from "react";
import * as Dropzone from "react-dropzone";
import { times } from "lodash";
import { InputProps } from "../interfaces";

interface State {
  value: any;
  focus: boolean;
  error: string;
}

const INITIAL_STATE = {
  value: "",
  focus: false,
  error: ""
};

class InputField extends React.Component<InputProps, State> {
  state = INITIAL_STATE;

  componentDidMount() {
    if (this.props.defaultValue) {
      this.setState({ value: this.props.defaultValue });
    } else if (this.props.type == "checkbox") {
      this.setState({ value: this.props.defaultValue ? true : false });
    } else if (this.props.type == "picture") {
      this.setState({ value: null });
    }
  }

  handleChange = async e => {
    const { value } = e.target;

    if (this.props.type == "checkbox" || this.props.type == "agb") {
      await this.setState(prevState => ({ value: !prevState.value }));
    } else {
      e.preventDefault();
      let error = "";

      if (this.props.validate) {
        error = this.props.validate(value);

        if (error && this.props.setError) {
          this.props.setError();
        } else if (!error && this.props.setValid) {
          this.props.setValid();
        }
      }
      await this.setState({ value, error });
    }

    if (this.props.handleChange) {
      this.props.handleChange(this.state.value, this.state.error ? true : false);
    }
  };

  handleDrop = files => this.setState({ value: files });

  render() {
    const { value, error } = this.state;
    const { submitting, icon, label, type, options, multiple, ...inputProps } = this.props;

    switch (type) {
      case "checkbox": {
        return (
          <label className="vipfy-checkbox">
            <i className={`fal fa-${icon}`} />
            <span>{label}</span>

            <input
              type="checkbox"
              disabled={this.props.submitting}
              checked={value ? true : false}
              onChange={this.handleChange}
              {...inputProps}
            />

            <svg className={value ? "vipfy-checkbox-checked" : ""} viewBox="0 0 18 18">
              <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
              <polyline points="1 9 7 14 15 4" />
            </svg>
          </label>
        );
      }

      case "select": {
        delete inputProps.defaultValue;
        const { defaultValue } = this.props;

        return (
          <div className="vipfy-input-holder">
            <i className={`fal fa-${icon}`} />
            <select
              onChange={this.handleChange}
              value={value}
              {...inputProps}
              className="generic-dropdown">
              <option value={defaultValue ? defaultValue : ""}>
                {defaultValue ? defaultValue : " "}
              </option>
              {options &&
                options.map((option, key) => (
                  <option key={key} value={option}>
                    {option}
                  </option>
                ))}
            </select>
            <label htmlFor={this.props.name} className="vipfy-label-active">
              {label}
            </label>
          </div>
        );
      }

      case "selectObject": {
        return (
          <div className="vipfy-input-holder">
            <i className={`fal fa-${icon}`} />
            <select
              onChange={this.handleChange}
              value={value}
              {...inputProps}
              className="generic-dropdown">
              <option value=""> </option>
              {options &&
                options.map(({ name, value }, key) => (
                  <option selected={this.state.value == value} key={key} value={value}>
                    {name}
                  </option>
                ))}
            </select>

            <label htmlFor={this.props.name} className="vipfy-label-active">
              {label}
            </label>
          </div>
        );
      }

      case "textField": {
        return (
          <textarea
            className="text-field"
            name={name}
            value={value}
            onChange={this.handleChange}
            {...inputProps}
          />
        );
      }

      case "subDomain": {
        return (
          <div className="combo-holder">
            <select name="protocol" onChange={this.handleChange} className="generic-dropdown">
              <option value="https">https://</option>
              <option value="http">http://</option>
            </select>
            <input
              type="text"
              className="searchbar"
              value={value}
              onChange={this.handleChange}
              {...inputProps}
            />
          </div>
        );
      }

      case "stars": {
        return (
          <div className="stars-holder">
            {times(5, i => (
              <i
                key={i}
                className={`fa${
                  (value >= i && !value) || (value && value > i) ? "s" : "r"
                } fa-star star`}
                onMouseOver={() => this.setState({ value: i })}
                onMouseLeave={() => {
                  if (!value) {
                    this.setState(prevState => ({ value: prevState.value - 1 }));
                  }
                }}
                onClick={() => this.setState(prevState => ({ value: prevState.value + 1 }))}
              />
            ))}
          </div>
        );
      }

      case "agb": {
        return (
          <div className="checkOrderHolderLawBox">
            <div>
              <div className="lawholder">
                <span className="lawheading">
                  Please read the following third party agreements (external links)
                </span>
                <span
                  className="lawlink"
                  onClick={() => {
                    require("electron").shell.openExternal(this.props.lawLink);
                  }}>
                  Terms of Service
                </span>

                <span
                  className="lawlink"
                  onClick={() => {
                    require("electron").shell.openExternal(this.props.placeholderprivacyLink);
                  }}>
                  Privacy
                </span>
              </div>
              <div className="agreementBox">
                <input
                  type="checkbox"
                  name="agb"
                  className="cbx"
                  id="agb-checkbox"
                  onChange={this.handleChange}
                  {...inputProps}
                />
                <label htmlFor="agb-checkbox" className="check">
                  <svg width="18px" height="18px" viewBox="0 0 18 18">
                    <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                  <span className="agreementSentence">
                    {`I agree to the above third party agreements and to our Terms of Service
                    and Privacy agreement regarding ${this.props.appName}`}
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      }

      case "picture":
        {
          const renderContent = () => {
            if (value && !multiple) {
              return (
                <img
                  alt={value.name}
                  height="188px"
                  width="188px"
                  className="img-circle"
                  src={value.preview}
                />
              );
            } else if (multiple && value && Array.isArray(value)) {
              return (
                <div className="pics-preview">
                  {value.map((file, i) => (
                    <img key={i} alt={file.name} height="50px" width="50px" src={file.preview} />
                  ))}
                </div>
              );
            } else if (multiple) {
              return <label>{label ? label : "Please select several pictures for upload"}</label>;
            } else {
              return (
                <label>{label ? label : "Click again or drag & drop to change the pic"}</label>
              );
            }
          };

          if (submitting || this.props.success) {
            return;
          }

          return (
            <Dropzone
              name={name}
              activeClassName="dropzone-active"
              accept="image/*"
              type="file"
              multiple={multiple ? true : false}
              className={value ? "dropzone-preview" : "dropzone"}
              onDrop={
                multiple ? files => this.handleDrop(files) : ([file]) => this.handleDrop(file)
              }>
              {renderContent()}
            </Dropzone>
          );
        }
        break;

      default: {
        return (
          <div className="vipfy-input-holder">
            <i className={`fal fa-${icon}`} />

            <input
              id={this.props.name}
              disabled={submitting}
              type={type}
              onFocus={() => this.setState({ focus: true })}
              onBlur={() => this.setState({ focus: false })}
              className={
                type == "color"
                  ? "color-picker"
                  : `vipfy-input${error ? "-error" : value ? "-active" : ""}`
              }
              value={value}
              onChange={this.handleChange}
              {...inputProps}
            />
            <label
              htmlFor={this.props.name}
              className={`vipfy-label${this.state.focus || value ? "-active" : ""}`}>
              {label}
            </label>
            <span className={`vipfy-label${error ? "-error" : ""}`}>{error}</span>
          </div>
        );
      }
    }
  }
}

export default InputField;
