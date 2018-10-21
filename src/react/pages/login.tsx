import * as React from "react";
import { Link } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { updateUser } from "../mutations/auth";
import { emailRegex, countries, industries, subIndustries } from "../common/constants";
import { filterError } from "../common/functions";
import { valueFromAST } from "graphql";

const CREATE_COMPANY = gql`
  mutation onCreateCompany($name: String!, $legal: LegalInput!) {
    createCompany(name: $name, legalinformation: $legal) {
      ok
      token
      refreshToken
    }
  }
`;

const CREATE_ADDRESS = gql`
  mutation onCreateAddress($addressData: AddressInput!, $department: Boolean) {
    createAddress(addressData: $addressData, department: $department) {
      ok
    }
  }
`;

const SEARCH_COMPANY = gql`
  mutation onSearchAddressByCompanyName($company: String!) {
    searchAddressByCompanyName(input: $company)
  }
`;

export const CHECK_EMAIL = gql`
  mutation onCheckEmail($email: String) {
    checkEmail(email: $email) {
      ok
    }
  }
`;

export const CHECK_VAT = gql`
  mutation onCheckVat($vat: String!, $cc: String!) {
    checkVat(vat: $vat, cc: $cc) {
      ok
    }
  }
`;

interface Props {
  error: string;
  register: Function;
  login: Function;
  moveTo: Function;
  createCompany: Function;
  updateUser: Function;
  createAddress: Function;
  searchCompany: Function;
  afterRegistration: Function;
  checkEmail: Function;
  checkVat: Function;
}

interface State {
  loginMove: boolean;
  forgotMove: boolean;
  error: string;
  errorbool: boolean;
  focus: number;
  login: boolean;
  newsletter: boolean;
  registerbool: boolean;
  registerStep: number;
  registering: boolean;
  loggingin: boolean;
  registerMove: boolean;
  agreementa: boolean;
  agreementb: boolean;
  companyname: string;
  email: string;
  industry: string;
  country: string;
  countryCode: string;
  isEU: boolean;
  subindustry: string;
  companyStage: string;
  selectedOption: string;
  name: string;
  address: string;
  possibleAddresses: string[];
  vatId: string;
}

class Login extends React.Component<Props, State> {
  state = {
    loginMove: false,
    forgotMove: false,
    error: this.props.error + "" || "No error",
    errorbool: this.props.error ? true : false,
    focus: 1,
    login: true,
    newsletter: false,
    registerbool: false,
    registerStep: 1,
    loggingin: false,
    registering: false,
    registerMove: false,
    agreementa: false,
    agreementb: false,
    companyname: "",
    email: "",
    industry: "",
    country: "",
    countryCode: "OT",
    isEU: false,
    subindustry: "",
    companyStage: "",
    selectedOption: "",
    name: "",
    address: "",
    possibleAddresses: [],
    vatId: ""
  };

  emailInput: HTMLInputElement;
  passInput: HTMLInputElement;
  registerInput: HTMLInputElement;
  remailInput: HTMLInputElement;
  nameInput: HTMLInputElement;
  companyInput: HTMLInputElement;
  vatInput: HTMLInputElement;
  countrySelect: HTMLSelectElement;

  componentDidMount() {
    if (this.props.error) {
      this.setState({
        error: this.props.error,
        errorbool: true
      });
    }
  }

  handleClickOutside = () => {
    this.setState({ possibleAddresses: [] });
  };

  cheat() {
    this.emailInput.value = "nv@vipfy.com";
    this.passInput.value = "12345678";
    this.handleEnter(null, null, true);
  }

  searchCompany = async e => {
    const company = e.target.value;

    if (company.length > 2) {
      const addresses = await this.props.searchCompany({ variables: { company } });
      this.setState({ possibleAddresses: addresses.data.searchAddressByCompanyName });
    } else {
      if (this.state.possibleAddresses.length > 0) {
        this.setState({ possibleAddresses: [] });
      }
    }
  };

  selectAddress = async address => {
    console.table(countries);
    let country = address.description
      .split(",")
      .pop()
      .trim();

    if (country == "UK") {
      country = "United Kingdom";
    } else if (country == "USA") {
      country = "United States of America";
    }

    const fullCountryInfo = countries.filter(item => item.name == country);

    if (fullCountryInfo.length == 0) {
      await this.setState({
        address: address.place_id,
        possibleAddresses: [],
        countryCode: "OT",
        country,
        isEU: false
      });
    } else {
      const { isEU, value } = fullCountryInfo[0];
      if (country.length > 2) {
        await this.setState({
          address: address.place_id,
          possibleAddresses: [],
          country,
          countryCode: value,
          isEU
        });
      }
      if (this.vatInput && this.vatInput.value) {
        this.vatInput.value = this.state.countryCode;
      }
    }

    this.companyInput.value = address.structured_formatting.main_text.split(",")[0];
  };

  checkEmail = async e => {
    e.preventDefault();
    try {
      await this.props.checkEmail({ variables: { email: e.target.value } });
    } catch (error) {
      this.setState({
        error: filterError(error),
        errorbool: true
      });
    }
  };

  loginClick = () => this.handleEnter(null, null, true);

  login = async () => {
    await this.setState({ errorbool: false, error: "No error", loggingin: true });
    const ok = await this.props.login(this.emailInput.value, this.passInput.value);

    if (ok !== true) {
      this.setState({ errorbool: true, error: ok, loggingin: false });
    } else {
      this.props.moveTo("dashboard");
    }
  };

  forgetClick = () => this.setState({ forgotMove: true });

  handleEnter(e, field, force = false) {
    if (field === 3 && (force || e.key === "Enter")) {
      let email = this.registerInput.value;
      if (email.includes("@") && email.includes(".")) {
        return this.register();
      } else {
        this.registerInput.focus();
        this.setState({
          focus: 3,
          errorbool: true,
          error: "Not an Email Address."
        });
        return;
      }
    }

    if (force || e.key === "Enter") {
      let email = this.emailInput.value;
      let pass = this.passInput.value;
      this.setState({ errorbool: false });

      if (email.match(emailRegex) && !(pass === "")) {
        //Email Basic Check and Password not empty -> Check
        this.login();
      } else if (!(email.includes("@") && email.includes("."))) {
        //Email Basic Check not successfull -> Delete PassInput and focus email (again)
        this.passInput.value = "";
        this.emailInput.focus();
        this.setState({
          focus: 1,
          errorbool: true,
          error: "Not an Email Address."
        });
      } else if (pass === "") {
        //Email Basic Check ok, but no password -> if focus before on email than just focus, otherwise also error
        if (!(this.state.focus === 1)) {
          this.setState({
            errorbool: true,
            error: "Please insert your password."
          });
        }
        this.passInput.focus();
        this.setState({ focus: 2 });
      } else {
        this.passInput.value = "";
        this.emailInput.focus();
        this.setState({
          focus: 1,
          errorbool: true,
          error: "Not an Email Address or Password not set"
        });
      }
    } else {
      this.setState({ focus: field });
    }
  }

  changeLogin = bool =>
    this.setState({ registerMove: false, errorbool: false, forgotMove: false, login: bool });

  registerClick = () => this.handleEnter(null, 3, true);

  register() {
    this.setState({ registerMove: true });
    this.props.register(this.registerInput.value, this.state.newsletter);
  }

  registerSave = async () => {
    this.setState({ registering: true });

    const { vatId, agreementa, agreementb } = this.state;
    try {
      if (!agreementa) {
        throw new Error("Please agree our Terms of Service and Privacy Settings");
      }

      await this.props.register(this.state.email);
      const res = await this.props.createCompany({
        variables: {
          name: this.state.companyname,
          legal: {
            vatId,
            termsOfService: new Date().toISOString(),
            privacy: new Date().toISOString(),
            noVatRequired: agreementb
          }
        }
      });

      const { token, refreshToken } = res.data.createCompany;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      let statisticdata = {
        industry: this.state.industry,
        country: this.state.countryCode,
        subIndustry: this.state.subindustry,
        companyStage: this.state.selectedOption
      };

      let user = {};
      if (this.state.name != "") {
        let nameArray = [];
        nameArray = this.state.name.split(" ");
        if (nameArray.length === 1) {
          user = { lastname: nameArray[0] };
        } else if (nameArray.length === 2) {
          user = { firstname: nameArray[0], lastname: nameArray[1] };
        } else {
          let middleArray = nameArray.slice(0);
          middleArray.pop();
          middleArray.shift();
          user = {
            firstname: nameArray[0],
            middlename: middleArray.join(" "),
            lastname: nameArray[nameArray.length - 1]
          };
        }
      }

      await this.props.updateUser({ variables: { user } });
      this.props.afterRegistration(this.state.address, statisticdata);

      return this.props.moveTo("dashboard/newuser");
    } catch (err) {
      console.log(err);
      this.setState({
        error: err.message,
        errorbool: true,
        registering: false
      });
    }
  };

  switchState(bool) {
    this.setState({
      registerbool: bool,
      errorbool: false,
      registerStep: 1,
      registering: false,
      loggingin: false
    });
    this.emailInput.value = "";
    this.passInput.value = "";
    this.setState({
      email: "",
      agreementa: false,
      name: "",
      companyname: "",
      agreementb: false
    });
  }

  setStep(n) {
    this.setState({ registerStep: n });
  }

  async checkStep(step) {
    this.setState({ errorbool: false });
    switch (step) {
      case 1:
        if (
          !(
            this.remailInput &&
            this.remailInput.value.includes("@") &&
            this.remailInput.value.includes(".")
          )
        ) {
          this.setState({
            errorbool: true,
            error: "Please insert a valid email."
          });
          return;
        }
        if (!(this.nameInput && this.nameInput.value)) {
          this.setState({
            errorbool: true,
            error: "Please insert a name for you."
          });
          return;
        }
        if (!this.state.agreementa) {
          this.setState({
            errorbool: true,
            error: "Please agree to the Terms of Service and Privacy Agreement."
          });
          return;
        }
        this.setState({
          name: this.nameInput.value,
          email: this.remailInput.value,
          agreementa: true
        });
        this.setStep(2);
        break;

      case 2:
        console.log("%c State", "color: red;", this.state);
        if (!(this.companyInput && this.companyInput.value)) {
          this.setState({
            errorbool: true,
            error: "Please insert a company name for you."
          });
          return;
        }

        if (!this.state.country) {
          this.setState({
            errorbool: true,
            error: "Please insert a country for your company."
          });
          return;
        }

        if (!this.state.isEU && !this.state.agreementb) {
          this.setState({
            errorbool: true,
            error: "Please verify that you can accept invoices without VAT."
          });
          return;
        } else if (this.state.isEU && this.vatInput.value.length < 3) {
          this.setState({
            errorbool: true,
            error: "Please enter a Vatnumber."
          });
          return;
        }

        this.setState({ companyname: this.companyInput.value, agreementb: true });

        if (this.state.isEU && this.vatInput.value.length > 3) {
          try {
            await this.props.checkVat({
              variables: { vat: this.vatInput.value, cc: this.state.countryCode }
            });

            this.setState({ vatId: this.vatInput.value });
          } catch (error) {
            this.setState({
              errorbool: true,
              error: "This Vatnumber is not valid."
            });

            return;
          }
        }

        this.setStep(3);
        break;
      case 3:
        this.setStep(4);
        break;
      case 4:
        console.log(this.state);
        this.registerSave();
        break;
    }
  }

  showStep(activeStep, stepRepresent) {
    if (activeStep === stepRepresent) {
      return (
        <div
          className="step stepactive"
          style={{
            top: `calc(9.5rem - 9.5rem/8*${stepRepresent - 2})`,
            left: `calc(7.5rem + 9.5rem/8*${stepRepresent - 2})`
          }}
        />
      );
    } else if (activeStep < stepRepresent) {
      return (
        <div
          className="step"
          style={{
            top: `calc(9.5rem - 9.5rem/8*${stepRepresent - 2})`,
            left: `calc(7.5rem + 9.5rem/8*${stepRepresent - 2})`
          }}
        />
      );
    } else {
      return (
        <div
          className="step stepdone"
          onClick={() => this.setStep(stepRepresent)}
          style={{
            top: `calc(9.5rem - 9.5rem/8*${stepRepresent - 2})`,
            left: `calc(7.5rem + 9.5rem/8*${stepRepresent - 2})`,
            cursor: "pointer"
          }}
        />
      );
    }
  }

  showButtons(step) {
    switch (step) {
      case 1:
        return (
          <div className="registerButtons">
            <div className="partButton_ToLogin" onClick={() => this.switchState(false)}>
              Already registered?
            </div>
            <div className="partButton_Next" onClick={() => this.checkStep(step)}>
              Next
            </div>
          </div>
        );
        break;

      case 2:
        return (
          <div className="registerButtons">
            <div className="partButton_ToLogin" onClick={() => this.switchState(false)}>
              Already registered?
            </div>
            <div className="partButton_Next" onClick={() => this.checkStep(step)}>
              Next
            </div>
          </div>
        );
        break;

      case 3:
        return (
          <div className="registerButtons">
            <div className="partButton_ToLogin" onClick={() => this.switchState(false)}>
              Already registered?
            </div>
            <div className="partButton_Next" onClick={() => this.checkStep(step)}>
              Skip
            </div>
          </div>
        );
        break;

      case 4:
        return (
          <div className="registerButtons">
            <div className="partButton_ToLogin" onClick={() => this.switchState(false)}>
              Already registered?
            </div>
            <div className="partButton_Next" onClick={() => this.checkStep(step)}>
              {this.state.registering ? (
                <div className="spinner loginspinner">
                  <div className="double-bounce1" />
                  <div className="double-bounce2" />
                </div>
              ) : (
                <span>Save</span>
              )}
            </div>
          </div>
        );
        break;
    }
  }

  optionClick(option) {
    this.setState({ selectedOption: option });
    this.setStep(4);
  }

  registerForm(step) {
    switch (step) {
      case 1:
        return (
          <div className="partForm partForm_Register">
            <div style={{ marginBottom: "1rem" }}>
              <label>Your Email:</label>
              <input
                key="remail"
                className="newInputField"
                placeholder="Email"
                onBlur={this.checkEmail}
                //autoFocus
                //onKeyPress={e => this.handleEnter(e, 1)}
                ref={input => {
                  this.remailInput = input!;
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Your name:</label>
              <input
                key="name"
                className="newInputField"
                placeholder="Your Name"
                //autoFocus
                //onKeyPress={e => this.handleEnter(e, 1)}
                ref={input => {
                  this.nameInput = input!;
                }}
              />
            </div>
            <div className="agreementBox">
              <input
                type="checkbox"
                className="cbx"
                id="CheckBox"
                style={{ display: "none" }}
                onChange={e => this.setState({ agreementa: e.target.checked })}
              />
              <label htmlFor="CheckBox" className="check">
                <svg width="18px" height="18px" viewBox="0 0 18 18">
                  <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                  <polyline points="1 9 7 14 15 4" />
                </svg>
                <span className="agreementSentence">
                  I agree to the Terms of Service and Privacy Agreement of VIPFY.
                </span>
              </label>
            </div>
          </div>
        );
        break;

      case 2:
        return (
          <div className="partForm partForm_Register">
            <div style={{ marginBottom: "1rem" }}>
              <label>Company name:</label>
              <input
                key="cname"
                className="newInputField"
                placeholder="Your Companyname"
                onChange={this.searchCompany}
                //onKeyPress={e => this.handleEnter(e, 2)}
                ref={input => {
                  this.companyInput = input!;
                }}
              />
            </div>

            <div
              className={`possible-addresses-${
                this.state.possibleAddresses.length > 0 ? "show" : "hide"
              }`}>
              {this.state.possibleAddresses.map((address, key) => (
                <div
                  className="possible-addresses-item"
                  onClick={() => this.selectAddress(address)}
                  key={key}>
                  <i className="fas fa-map-marker-alt" />
                  <span>
                    <strong>
                      {address.structured_formatting.main_text}
                      &nbsp;
                    </strong>
                    <span>{address.structured_formatting.secondary_text}</span>
                  </span>
                </div>
              ))}
              <button
                className="possible-addresses-close-button"
                type="button"
                onClick={() => this.setState({ possibleAddresses: [] })}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="chooseStage">
              <label>Country:</label>
              <div className="optionHolder">
                <select
                  style={this.state.address ? { fontWeight: "bold" } : {}}
                  // disabled={this.state.address ? true : false}
                  placeholder="Select Country"
                  name="country"
                  ref={select => {
                    this.countrySelect = select!;
                  }}
                  onChange={e => {
                    const value = e.target.value;
                    const name = e.target.name;
                    this.setField(e);
                    console.log(`%c ${value}`, "background: BADA55, font-weight: bold;");
                    this.setState({
                      isEU: countries.filter(country => country.value == value)[0].isEU,
                      countryCode: value,
                      country: name
                    });

                    if (
                      countries.filter(country => country.value == value)[0].isEU &&
                      this.vatInput &&
                      this.vatInput.value
                    ) {
                      this.vatInput.value = value;
                    }
                  }}
                  defaultValue="">
                  <option value="" disabled hidden>
                    {this.state.country ? this.state.country : "Please choose your country"}
                  </option>
                  {countries.map(({ value, name }) => (
                    <option
                      key={value}
                      value={value}
                      selected={this.state.countryCode == value ? true : false}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {this.state.country ? (
              !countries.filter(country => country.value == this.state.countryCode)[0].isEU ? (
                this.state.countryCode != "US" ? (
                  <div>We are sorry, but VIPFY is not available yet in your country.</div>
                ) : (
                  <div className="agreementBox float-in-right">
                    <input
                      type="checkbox"
                      className="cbx"
                      id="CheckBox2"
                      key="Check2"
                      style={{ display: "none" }}
                      onChange={e => this.setState({ agreementb: e.target.checked, isEU: false })}
                    />
                    <label htmlFor="CheckBox2" className="check">
                      <svg width="18px" height="18px" viewBox="0 0 18 18">
                        <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                      <span className="agreementSentence">
                        I confirm to act as a business and be able to accept invoices without VAT.
                      </span>
                    </label>
                  </div>
                )
              ) : (
                <div className="chooseStage">
                  <label>
                    <span>Vatnumber:</span>
                    <input
                      type="text"
                      style={{ width: "18rem" }}
                      className="newInputField float-in-right"
                      onChange={e => {
                        if (e.target.value.length == 2 || e.target.value.length > 7) {
                          if (e.target.value.toUpperCase() != this.state.countryCode) {
                            const { name, value } = countries.filter(
                              country => country.value == e.target.value.substr(0, 2).toUpperCase()
                            )[0];
                            this.setState({
                              country: name,
                              countryCode: value
                            });
                          }
                        }
                      }}
                      placeholder="Please enter your VAT"
                      defaultValue={this.state.countryCode}
                      ref={input => {
                        this.vatInput = input!;
                      }}
                    />
                  </label>
                </div>
              )
            ) : (
              ""
            )}
          </div>
        );
        break;

      case 3:
        return (
          <div className="partForm partForm_Register">
            <div className="chooseStage" style={{ display: "block" }}>
              <div className="Heading">Please choose the stage of your company</div>
              <div className="optionHolder" style={{ display: "flex" }}>
                <div className="option" onClick={() => this.optionClick("Existing Company")}>
                  Existing Company
                </div>
                <div className="option" onClick={() => this.optionClick("Implementation phase")}>
                  Implementation phase
                </div>
                <div className="option" onClick={() => this.optionClick("Idea phase")}>
                  Idea phase
                </div>
              </div>
            </div>
          </div>
        );
        break;

      case 4:
        return (
          <div className="partForm partForm_Register">
            <div className="chooseStage" style={{ marginBottom: "1.5rem" }}>
              <div className="Heading">Please choose the industry of your company</div>
              <div className="optionHolder">
                <select
                  placeholder="Select Industry"
                  name="industry"
                  onChange={e => this.setField(e)}
                  defaultValue="">
                  <option value="" disabled hidden>
                    Please choose an Industry
                  </option>
                  {industries.map(({ value, name }) => (
                    <option key={value} value={value}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {this.showSubIndustry(this.state.industry)}
          </div>
        );
        break;
    }
  }

  showSubIndustry(industryid: String) {
    if (subIndustries[industryid]) {
      let subIndustryArray: JSX.Element[] = [];
      subIndustries[industryid].forEach((element, index) => {
        subIndustryArray.push(
          <option key={`suboption-${index}`} value={element.value}>
            {element.title}
          </option>
        );
      });

      return (
        <div className="chooseStage">
          <div className="optionHolder">
            <select
              placeholder="Select Subindustry"
              name="subindustry"
              onChange={e => this.setField(e)}
              defaultValue="">
              <option value="" disabled hidden>
                Please choose a Subindustry
              </option>
              {subIndustryArray}
            </select>
          </div>
        </div>
      );
    }
  }

  setField = e => this.setState({ [e.target.name]: e.target.value });

  render() {
    return (
      <div className="centralize backgroundLogo">
        <div className="presideHolder">
          <div
            className={this.state.registerbool ? "lsrlHolder lsrlHolder_Register" : "lsrlHolder"}>
            <div className="partHolder">
              <div className="partHeading_Login" onDoubleClick={() => this.cheat()}>
                Please login to continue
              </div>
              <div
                className={
                  this.state.errorbool === false ? "formError noError" : "formError oneError"
                }>
                {this.state.error}
              </div>
              <div className="partForm partForm_Login">
                <div style={{ marginBottom: "1.5rem" }}>
                  <label>E-mail:</label>
                  <input
                    className="newInputField"
                    style={{ right: "0", position: "absolute" }}
                    placeholder="Your Email Address"
                    autoFocus
                    onKeyPress={e => this.handleEnter(e, 1)}
                    ref={input => {
                      this.emailInput = input!;
                    }}
                  />
                </div>
                <div>
                  <label>Password:</label>
                  <input
                    className="newInputField"
                    placeholder="Your Password"
                    type="password"
                    onKeyPress={e => this.handleEnter(e, 2)}
                    ref={input => {
                      this.passInput = input!;
                    }}
                  />
                  <div className="forgotPW">
                    <Link to="/passwordreset">Forgot Password?</Link>
                  </div>
                </div>
                <div className="partButton_ToRegister" onClick={this.loginClick}>
                  {this.state.loggingin ? (
                    <div className="spinner loginspinner">
                      <div className="double-bounce1" />
                      <div className="double-bounce2" />
                    </div>
                  ) : (
                    <span>Login</span>
                  )}
                </div>
                <div className="partButton" onClick={() => this.switchState(true)}>
                  Or Register
                </div>
              </div>
            </div>
            <div className="seperatorHolder" />
            <div
              className={
                this.state.registerbool ? "logoSeperator logoSeperator_Right" : "logoSeperator"
              }
            />
            <div className="partHolder">
              <div className="stepShower">
                {this.showStep(this.state.registerStep, 1)}
                {this.showStep(this.state.registerStep, 2)}
                {this.showStep(this.state.registerStep, 3)}
                {this.showStep(this.state.registerStep, 4)}
              </div>
              <div className="partHeading_Register">
                <div>Welcome to VIPFY</div>
              </div>
              <div
                className={
                  this.state.errorbool === false ? "formError noError" : "formError oneError"
                }>
                {this.state.error}
              </div>
              {this.registerForm(this.state.registerStep)}
              {this.showButtons(this.state.registerStep)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CREATE_COMPANY, {
    name: "createCompany"
  }),
  graphql(updateUser, {
    name: "updateUser"
  }),
  graphql(CREATE_ADDRESS, {
    name: "createAddress"
  }),
  graphql(CHECK_EMAIL, { name: "checkEmail" }),
  graphql(CHECK_VAT, { name: "checkVat" }),
  graphql(SEARCH_COMPANY, { name: "searchCompany" })
)(Login);
