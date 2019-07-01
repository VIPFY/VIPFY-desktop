import * as React from "react";
import { Link } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { updateUser } from "../mutations/auth";
import { emailRegex, countries, industries, subIndustries } from "../common/constants";
import { filterError } from "../common/functions";
import ReactPasswordStrength from "react-password-strength";
import { me } from "../queries/auth";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { CHANGE_PASSWORD } from "../mutations/auth";
import DataNameForm from "../components/dataForms/NameForm";
import DataNextForm from "../components/dataForms/NextForm";
import SignUpInGeneral from "../components/dataForms/SignUpInGeneralForm";
import ChangeAccount from "../components/dataForms/ChangeAccount";

const SIGN_UP = gql`
  mutation onSignUp($email: String!, $name: NameInput, $companyData: CompanyInput!) {
    signUp(email: $email, name: $name, companyData: $companyData) {
      ok
      token
    }
  }
`;

const UPDATE_STATISTIC_DATA = gql`
  mutation onUpdateStatisticData($data: StatisticInput!) {
    updateStatisticData(data: $data) {
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
    checkVat(vat: $vat, cc: $cc)
  }
`;

interface Props {
  error: string;
  register: Function;
  login: Function;
  moveTo: Function;
  updateUser: Function;
  searchCompany: Function;
  afterRegistration: Function;
  checkEmail: Function;
  checkVat: Function;
  updateStatisticData: Function;
  client: ApolloClient<InMemoryCache>;
}

interface State {
  loginMove: boolean;
  forgotMove: boolean;
  error: string | null;
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
  email: string | null;
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
  oldPassword: string;
  newPassword: string | null;
  newPasswordValid: boolean;
  repeatPassword: string | null;
  loading: boolean;
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
    email: null,
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
    vatId: "",
    oldPassword: "",
    newPassword: null,
    newPasswordValid: false,
    repeatPassword: null,
    loading: false
  };

  emailInput: HTMLInputElement;
  passInput: HTMLInputElement;
  registerInput: HTMLInputElement;
  remailInput: HTMLInputElement;
  nameInput: HTMLInputElement;
  companyInput: HTMLInputElement;
  vatInput: HTMLInputElement;
  countrySelect: HTMLSelectElement;
  pw1Input: HTMLSelectElement;
  pw2Input: HTMLSelectElement;

  componentDidMount() {
    if (this.props.error) {
      this.setState({
        error: this.props.error,
        errorbool: true
      });
    }
  }

  private passwordChanged(
    { score, password, isValid }: { score: number; password: string; isValid: boolean },
    feedback: any
  ): void {
    this.setState({ newPasswordValid: isValid, newPassword: password });
  }

  private repeatPasswordChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = e.target.value;
    this.setState({ repeatPassword: v });
  }

  private oldPasswordChanged(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = e.target.value;
    this.setState({ oldPassword: v });
  }

  private async confirm(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }
    await this.setState({ error: null, loading: true });
    try {
      await this.props.client.mutate({
        mutation: CHANGE_PASSWORD,
        variables: {
          pw: this.state.oldPassword,
          newPw: this.state.newPassword,
          confirmPw: this.state.repeatPassword
        }
      });
      await this.props.client.query({ query: me, fetchPolicy: "network-only" });
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
    await this.setState({ email: null, newPassword: null, repeatPassword: null });
  }

  private abort(): void {
    this.props.logMeOut();
  }

  private canSubmit(): boolean {
    return (
      (this.state.email &&
        this.state.newPasswordValid &&
        this.state.newPassword == this.state.repeatPassword) === true
    );
  }

  openExternal = (e, url) => {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  };

  handleClickOutside = () => {
    this.setState({ possibleAddresses: [] });
  };

  cheat() {}

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
      const email = e.target.value;
      if (email.includes("@") && email.includes(".")) {
        await this.props.checkEmail({ variables: { email: e.target.value } });
      }
      this.setState({ error: "", errorbool: false, email });
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
      if (!email.includes("@") && !email.includes(".")) {
        this.registerInput.focus();
        this.setState({
          focus: 3,
          errorbool: true,
          error: "Not an Email Address."
        });
      }
      return;
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

  registerSave = async () => {
    await this.setState({ registering: true });

    const { vatId, agreementa, agreementb, email, address } = this.state;
    try {
      if (!agreementa) {
        throw new Error("Please agree our Terms of Service and Privacy Settings");
      }

      const companyData = {
        name: this.state.companyname,
        legalinformation: {
          vatId,
          termsOfService: new Date().toISOString(),
          privacy: new Date().toISOString(),
          noVatRequired: agreementb
        }
      };

      const name = { firstname: "not set", lastname: "" };

      if (this.state.name != "") {
        const nameArray = this.state.name.split(" ");
        if (nameArray.length === 1) {
          name.lastname = nameArray[0];
        } else if (nameArray.length === 2) {
          name.firstname = nameArray[0];
          name.lastname = nameArray[1];
        } else {
          let middleArray = nameArray.slice(0);
          middleArray.pop();
          middleArray.shift();
          name.firstname = nameArray[0];
          name.middlename = middleArray.join(" ");
          name.lastname = nameArray[nameArray.length - 1];
        }
      }

      if (address) {
        companyData.placeid = address;
      }

      const res = await this.props.register({
        variables: { email, name, companyData }
      });
      const { ok, token } = res.data.signUp;

      if (ok) {
        localStorage.setItem("token", token);
      } else {
        throw new Error("Something went wrong");
      }

      let statisticdata = {
        industry: this.state.industry,
        country: this.state.countryCode,
        subIndustry: this.state.subindustry,
        companyStage: this.state.selectedOption
      };

      await this.props.updateStatisticData({ variables: { data: statisticdata } });

      this.props.afterRegistration(address);

      return this.props.moveTo("dashboard/newuser");
    } catch (err) {
      console.log("LoginError", err);
      this.setState({
        error: filterError(err),
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

        this.setState({ companyname: this.companyInput.value });

        if (this.state.isEU && this.vatInput.value.length > 3) {
          try {
            if (this.vatInput.value.substr(0, 2).toUpperCase() != "DE") {
              const res = await this.props.checkVat({
                variables: { vat: this.vatInput.value, cc: this.state.countryCode }
              });

              this.setState({
                vatId: this.vatInput.value,
                companyname: res.data.checkVat,
                agreementb: false
              });
            } else {
              this.setState({ vatId: this.vatInput.value, agreementb: false });
            }
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
            <div
              className="partButton_Next"
              id="registerStep1doneButton"
              onClick={() => this.checkStep(step)}>
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
            <div
              className="partButton_Next"
              id="registerStep2doneButton"
              onClick={() => this.checkStep(step)}>
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
            <div
              className="partButton_Next"
              id="registerStep3doneButton"
              onClick={() => this.checkStep(step)}>
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
            <div
              className="partButton_Next"
              id="registerSaveButton"
              onClick={() => this.checkStep(step)}>
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
                placeholder="user@example.com"
                onChange={this.checkEmail}
                //onKeyPress={e => this.handleEnter(e, 1)}
                ref={input => {
                  this.remailInput = input!;
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>Your Name:</label>
              <input
                key="name"
                className="newInputField"
                placeholder="John Doe"
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
              <label htmlFor="CheckBox" className="check agreementBoxReg">
                <svg width="18px" height="18px" viewBox="0 0 18 18">
                  <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                  <polyline points="1 9 7 14 15 4" />
                </svg>
                <span
                  className="agreementSentenceReg"
                  style={{ lineHeight: "18px", height: "18px", top: "-5px" }}>
                  I agree to the{" "}
                  <span
                    style={{ color: "#20BAA9" }}
                    onClick={e => this.openExternal(e, "https://vipfy.store/tos")}>
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span
                    style={{ color: "#20BAA9" }}
                    onClick={e => this.openExternal(e, "https://vipfy.store/pa")}>
                    Privacy Agreement
                  </span>{" "}
                  of VIPFY.
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
                      key={name}
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
                    <label
                      htmlFor="CheckBox2"
                      className="check agreementBoxReg"
                      style={{ textAlign: "left", display: "flex" }}>
                      <svg width="18px" height="18px" viewBox="0 0 18 18">
                        <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z" />
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                      <span className="agreementSentenceReg">
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
                          if (
                            e.target.value.toUpperCase() != this.state.countryCode &&
                            typeof e.target.value.charAt[0] == "string" &&
                            typeof e.target.value.charAt[1] == "string"
                          ) {
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
                    <span className="agreementSentenceReg">
                      Tipp: You probably have this on your website in the legal section
                    </span>
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
            <div className="chooseStage" style={{ marginBottom: "1.5rem", width: "24em" }}>
              <div className="Heading" style={{ fontSize: "0.8em", marginRight: "0.5em" }}>
                Please choose the industry of your company
              </div>
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

  renderLogin() {
    switch (this.state.loginprogress) {
      case "login":
        return (
          <SignUpInGeneral
            type="login"
            preloggedin={{ email: "nv@vipfy.com", name: "Nils", fullname: "Nils Vossebein" }}
          />
        );
      default:
        return (
          <SignUpInGeneral
            type="login"
            preloggedin={{ email: "nv@vipfy.com", name: "Nils", fullname: "Nils Vossebein" }}
          />
        );
    }
  }

  render() {
    return <div className="centralize backgroundLogo">{this.renderLogin()}</div>;

    return (
      <div className="centralize backgroundLogo">
        <ChangeAccount delete={true} />
      </div>
    );
    return (
      <div className="centralize backgroundLogo">
        <SignUpInGeneral
          type="login"
          preloggedin={{ email: "nv@vipfy.com", name: "Nils", fullname: "Nils Vossebein" }}
        />
      </div>
    );
    return (
      <div className="centralize backgroundLogo">
        <DataNameForm />
      </div>
    );
    return (
      <div className="centralize backgroundLogo">
        <DataNextForm username={"Lisa"} />
      </div>
    );

    //Old version
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
                <div
                  className="partButton"
                  id="registerStartButton"
                  onClick={() => this.switchState(true)}>
                  New here?
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
                {/*this.showStep(this.state.registerStep, 1)}
                {this.showStep(this.state.registerStep, 2)}
                {this.showStep(this.state.registerStep, 3)}
            {this.showStep(this.state.registerStep, 4)*/}
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
              {/*this.registerForm(this.state.registerStep)}
              {this.showButtons(this.state.registerStep)*/}
              <div className="partForm partForm_Register">
                <div style={{ marginBottom: "1rem" }}>
                  <label>Your Email:</label>
                  <input
                    key="remail"
                    className="newInputField"
                    placeholder="user@example.com"
                    onChange={this.checkEmail}
                    //onKeyPress={e => this.handleEnter(e, 1)}
                    ref={input => {
                      this.remailInput = input!;
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label>
                    New Password:
                    <ReactPasswordStrength
                      className="passwordStrength"
                      minLength={8}
                      minScore={2}
                      scoreWords={["too weak", "still too weak", "okay", "good", "strong"]}
                      tooShortWord={"too short"}
                      inputProps={{
                        name: "password_input",
                        autoComplete: "off",
                        placeholder: "Your Future Password",
                        className: "newInputField"
                      }}
                      changeCallback={(state, feedback) => this.passwordChanged(state, feedback)}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "1rem", position: "relative" }}>
                  <label>
                    <div style={{ float: "right" }}>
                      <input
                        className="newInputField"
                        style={{ right: "0" }}
                        placeholder="Your Future Password"
                        type="password"
                        autoComplete="off"
                        onChange={e => this.repeatPasswordChanged(e)}
                      />
                      {this.state.newPassword !== null &&
                      this.state.repeatPassword !== null &&
                      this.state.newPassword !== this.state.repeatPassword ? (
                        <span className="inputError">Doesn't match</span>
                      ) : (
                        <span />
                      )}
                    </div>
                    <div style={{ float: "right" }}>Repeat:</div>
                  </label>
                </div>
              </div>
              <div className="registerButtons">
                <div className="partButton_ToLogin" onClick={() => this.switchState(false)}>
                  Already registered?
                </div>
                {this.canSubmit() ? (
                  <div className="partButton_Next" onClick={() => this.conplete()}>
                    {this.state.loading ? (
                      <div className="spinner loginspinner">
                        <div className="double-bounce1" />
                        <div className="double-bounce2" />
                      </div>
                    ) : (
                      "Complete Setup"
                    )}
                  </div>
                ) : (
                  <div className="partButton_Next buttonDisabled">Complete Setup</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(SIGN_UP, {
    name: "register"
  }),
  graphql(updateUser, {
    name: "updateUser"
  }),
  graphql(UPDATE_STATISTIC_DATA, {
    name: "updateStatisticData"
  }),
  graphql(CHECK_EMAIL, { name: "checkEmail" }),
  graphql(CHECK_VAT, { name: "checkVat" }),
  graphql(SEARCH_COMPANY, { name: "searchCompany" })
)(Login);
