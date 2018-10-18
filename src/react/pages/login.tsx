import * as React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { updateUser } from "../mutations/auth";
import { emailRegex, countries } from "../common/constants";
import { filterError } from "../common/functions";
import { Link } from "react-router-dom";

const CREATE_COMPANY = gql`
  mutation onCreateCompany($name: String!) {
    createCompany(name: $name) {
      ok
      token
      refreshToken
    }
  }
`;

const UPDATE_STATISTIC_DATA = gql`
  mutation onUpdateStatisticData($data: JSON!) {
    updateStatisticData(data: $data) {
      ok
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
  updateStatisticData: Function;
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
    console.log(country);
    if (country == "UK") {
      country = "United Kingdom";
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
      this.vatInput.value = this.state.countryCode;
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
          error: "Not an E-mail Address."
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
          error: "Not an E-mail Address or Password not set"
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
    try {
      await this.props.register(this.state.email, this.state.agreementa);
      const res = await this.props.createCompany({ variables: { name: this.state.companyname } });

      const { token, refreshToken } = res.data.createCompany;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      let statisticdata = {
        noVat: this.state.agreementb,
        industry: this.state.industry,
        country: this.state.countryCode,
        subindustry: this.state.subindustry,
        companyStage: this.state.selectedOption
      };

      await this.props.updateStatisticData({ variables: { data: { ...statisticdata } } });

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
      // console.log(this.state.vatId);
      this.props.afterRegistration(this.state.address);

      return this.props.moveTo("dashboard/newuser");
    } catch (err) {
      console.log("ERR", err);
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
                    this.setField(e);
                    this.setState({
                      isEU: countries.filter(country => country.value == e.target.value)[0].isEU,
                      countryCode: e.target.value,
                      country: e.target.name
                    });

                    if (countries.filter(country => country.value == e.target.value)[0].isEU) {
                      this.vatInput.value = e.target.value;
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
                this.state.country != "USA" ? (
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
                        if (e.target.value.length == 2) {
                          if (e.target.value.toUpperCase() != this.state.countryCode) {
                            const { name, value } = countries.filter(
                              country => country.value == e.target.value.toUpperCase()
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
                <div className="option" onClick={() => this.optionClick(1)}>
                  Existing Company
                </div>
                <div className="option" onClick={() => this.optionClick(2)}>
                  Implementation phase
                </div>
                <div className="option" onClick={() => this.optionClick(3)}>
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
                  <option value="11">Agriculture, Forestry, Fishing and Hunting‎</option>
                  <option value="21">Mining, Quarrying, and Oil and Gas Extraction</option>
                  <option value="22">Utilities</option>
                  <option value="23">Construction</option>
                  <option value="31-33">Manufacturing</option>
                  <option value="42">Wholesale Trade</option>
                  <option value="44-45">Retail Trade</option>
                  <option value="48-49">Transportation and Warehousing</option>
                  <option value="51">Information</option>
                  <option value="52">Finance and Insurance</option>
                  <option value="53">Real Estate and Rental and Leasing</option>
                  <option value="54">Professional, Scientific, and Technical Services</option>
                  <option value="55">Management of Companies and Enterprises</option>
                  <option value="56">
                    Administrative and Support and Waste Management and Remediation Services
                  </option>
                  <option value="61">Educational Services</option>
                  <option value="62">Health Care and Social Assistance</option>
                  <option value="71">Arts, Entertainment, and Recreation</option>
                  <option value="72">Accommodation and Food Services</option>
                  <option value="81">Other Services (except Public Administration)</option>
                  <option value="92">Public Administration</option>
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
    const subIndustries = {
      "11": [
        { value: "111", title: "Crop Production" },
        { value: "112", title: "Animal Production and Aquaculture" },
        { value: "113", title: "Forestry and Logging" },
        { value: "114", title: "Fishing, Hunting and Trapping" },
        { value: "115", title: "Support Activities for Agriculture and Forestry" }
      ],
      "21": [
        { value: "211", title: "Oil and Gas Extraction" },
        { value: "212", title: "Mining (except Oil and Gas)" },
        { value: "213", title: "Support Activities for Mining" }
      ],
      "23": [
        { value: "236", title: "Construction of Buildings" },
        { value: "237", title: "Heavy and Civil Engineering Construction" },
        { value: "238", title: "Specialty Trade Contractors" }
      ],
      "31-33": [
        { value: "311", title: "Food Manufacturing" },
        { value: "312", title: "Beverage and Tobacco Product Manufacturing" },
        { value: "313", title: "Textile Mills" },
        { value: "314", title: "Textile Product Mills" },
        { value: "315", title: "Apparel Manufacturing" },
        { value: "316", title: "Leather and Allied Product Manufacturing" },
        { value: "321", title: "Wood Product Manufacturing" },
        { value: "322", title: "Paper Manufacturing" },
        { value: "323", title: "Printing and Related Support Activities" },
        { value: "324", title: "Petroleum and Coal Products Manufacturing" },
        { value: "325", title: "Chemical Manufacturing" },
        { value: "326", title: "Plastics and Rubber Products Manufacturing" },
        { value: "327", title: "Nonmetallic Mineral Product Manufacturing" },
        { value: "331", title: "Primary Metal Manufacturing" },
        { value: "332", title: "Fabricated Metal Product Manufacturing" },
        { value: "333", title: "Machinery Manufacturing" },
        { value: "334", title: "Computer and Electronic Product Manufacturing" },
        { value: "335", title: "Electrical Equipment, Appliance, and Component Manufacturing" },
        { value: "336", title: "Transportation Equipment Manufacturing" },
        { value: "337", title: "Furniture and Related Product Manufacturing" },
        { value: "339", title: "Miscellaneous Manufacturing" }
      ],
      "42": [
        { value: "423", title: "Merchant Wholesalers, Durable Goods" },
        { value: "424", title: "Merchant Wholesalers, Nondurable Goods" },
        { value: "425", title: "Wholesale Electronic Markets and Agents and Brokers" }
      ],
      "44-45": [
        { value: "441", title: "Motor Vehicle and Parts Dealers" },
        { value: "442", title: "Furniture and Home Furnishings Stores" },
        { value: "443", title: "Electronics and Appliance Stores" },
        { value: "444", title: "Building Material and Garden Equipment and Supplies Dealers" },
        { value: "445", title: "Food and Beverage Stores" },
        { value: "446", title: "Health and Personal Care Stores" },
        { value: "447", title: "Gasoline Stations" },
        { value: "448", title: "Clothing and Clothing Accessories Stores" },
        { value: "451", title: "Sporting Goods, Hobby, Musical Instrument, and Book Stores" },
        { value: "452", title: "General Merchandise Stores" },
        { value: "453", title: "Miscellaneous Store Retailers" },
        { value: "454", title: "Nonstore Retailers" }
      ],
      "48-49": [
        { value: "481", title: "Air Transportation" },
        { value: "482", title: "Rail Transportation" },
        { value: "483", title: "Water Transportation" },
        { value: "484", title: "Truck Transportation" },
        { value: "485", title: "Transit and Ground Passenger Transportation" },
        { value: "486", title: "Pipeline Transportation" },
        { value: "487", title: "Scenic and Sightseeing Transportation" },
        { value: "488", title: "Support Activities for Transportation" },
        { value: "491", title: "Postal Service" },
        { value: "492", title: "Couriers and Messengers" },
        { value: "493", title: "Warehousing and Storage" }
      ],
      "51": [
        { value: "511", title: "Publishing Industries (except Internet)" },
        { value: "512", title: "Motion Picture and Sound Recording Industries" },
        { value: "515", title: "Broadcasting (except Internet)" },
        { value: "517", title: "Telecommunications" },
        { value: "518", title: "Data Processing, Hosting, and Related Services" },
        { value: "519", title: "Other Information Services" }
      ],
      "52": [
        { value: "521", title: "Monetary Authorities-Central Bank" },
        { value: "522", title: "Credit Intermediation and Related Activities" },
        {
          value: "523",
          title:
            "Securities, Commodity Contracts, and Other Financial Investments and Related Activities"
        },
        { value: "524", title: "Insurance Carriers and Related Activities" },
        { value: "525", title: "Funds, Trusts, and Other Financial Vehicles" }
      ],
      "53": [
        { value: "531", title: "Real Estate" },
        { value: "532", title: "Rental and Leasing Services" },
        {
          value: "533",
          title: "Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)"
        }
      ],
      "56": [
        { value: "561", title: "Administrative and Support Services" },
        { value: "562", title: "Waste Management and Remediation Services" }
      ],
      "62": [
        { value: "621", title: "Ambulatory Health Care Services" },
        { value: "622", title: "Hospitals" },
        { value: "623", title: "Nursing and Residential Care Facilities" },
        { value: "624", title: "Social Assistance" }
      ],
      "71": [
        { value: "711", title: "Performing Arts, Spectator Sports, and Related Industries" },
        { value: "712", title: "Museums, Historical Sites, and Similar Institutions" },
        { value: "713", title: "Amusement, Gambling, and Recreation Industries" }
      ],
      "72": [
        { value: "721", title: "Accommodation" },
        { value: "722", title: "Food Services and Drinking Places" }
      ],
      "81": [
        { value: "811", title: "Repair and Maintenance " },
        { value: "812", title: "Personal and Laundry Services" },
        {
          value: "813",
          title: "Religious, Grantmaking, Civic, Professional, and SimilarOrganizations"
        },
        { value: "814", title: "Private Households" }
      ],
      "92": [
        { value: "921", title: "Executive, Legislative, and Other General Government Support" },
        { value: "922", title: "Justice, Public Order, and Safety Activities" },
        { value: "923", title: "Administration of Human Resource Programs" },
        { value: "924", title: "Administration of Environmental Quality Programs" },
        {
          value: "925",
          title: "Administration of Housing Programs, Urban Planning, and Community Development"
        },
        { value: "926", title: "Administration of Economic Programs" },
        { value: "927", title: "Space Research and Technology" },
        { value: "928", title: "National Security and International Affairs" }
      ]
    };
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
  graphql(UPDATE_STATISTIC_DATA, {
    name: "updateStatisticData"
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
