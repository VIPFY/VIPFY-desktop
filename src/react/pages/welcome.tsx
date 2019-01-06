import * as React from "react";
import { countries } from "../common/constants";
import gql from "graphql-tag";
import { Query, graphql, compose, withApollo } from "react-apollo";

import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { QUERY_USER } from "../queries/user";
import { me } from "../queries/auth";
import * as Dropzone from "react-dropzone";
import { any } from "async";
import GenericInputField from "../components/GenericInputField";

const UPDATE_PIC = gql`
  mutation UpdatePic($file: Upload!) {
    updateProfilePic(file: $file)
  }
`;

const UPDATE_LOGO = gql`
  mutation updateCompanyPic($file: Upload!) {
    updateCompanyPic(file: $file)
  }
`;

const SEARCH_COMPANY = gql`
  mutation onSearchAddressByCompanyName($company: String!) {
    searchAddressByCompanyName(input: $company)
  }
`;

export const CHECK_VAT = gql`
  mutation onCheckVat($vat: String!, $cc: String!) {
    checkVat(vat: $vat, cc: $cc)
  }
`;

export const SETUP_FINISHED = gql`
  mutation setupFinished(
    $country: String
    $vatoption: Int
    $vatnumber: String
    $placeId: String
    $ownAdress: String
    $username: String
  ) {
    setupFinished(
      country: $country
      vatoption: $vatoption
      vatnumber: $vatnumber
      placeId: $placeId
      ownAdress: $ownAdress
      username: $username
    ) {
      ok
    }
  }
`;

interface Props {
  showPopup: Function;
  moveTo: Function;
  client: ApolloClient<InMemoryCache>;
  updatePic: Function;
  userid: number;
  companyName?: string;
  checkVat: Function;
  country: string;
  setupFinished: Function;
  updateUserpicture: Function;
  updateCompanyLogo: Function;
}

interface State {
  show: number;
  country: string | null;
  name: string | null;
  isEU: boolean;
  countryCode: string | null;
  vatnumber: string | null;
  vatoption: number;
  profilepicture: any;
  error: string | null;
  predictions: { data: any } | null;
  placeId: string | null;
  ownAddress: string | null;
  companypicture: any;
  street: string | null;
  streetfocus: boolean;
  zip: string | null;
  zipfocus: boolean;
  city: string | null;
  cityfocus: boolean;
  countryfocus: boolean;
}

class Welcome extends React.Component<Props, State> {
  state = {
    show: 1,
    country: null,
    name: null,
    isEU: false,
    countryCode: null || this.props.country,
    vatnumber: null,
    vatoption: 0,
    profilepicture: null,
    error: null,
    predictions: null,
    placeId: null,
    ownAddress: null,
    companypicture: null,
    street: null,
    streetfocus: false,
    city: null,
    cityfocus: false,
    countryfocus: false,
    zipfocus: false,
    zip: null
  };

  componentDidMount() {
    this.searchCompany();
  }

  searchCompany = async () => {
    const predictions = await this.props.client.query({
      query: gql`
        {
          searchAddressByCompanyName
        }
      `
    });
    console.log("Predictions", predictions);
    this.setState({ predictions });
  };

  uploadPic = async ({ picture }) => {
    try {
      await this.props.updatePic({ variables: { file: picture }, refetchQueries: ["me"] });
      return true;
    } catch (err) {
      console.log("UPLOAD FAILED", err);
    }
  };

  handleDrop = files => {
    console.log("DROP", files);
    if (files) {
      if (files.type.includes("image/")) {
        console.log(files);
        this.setState({ profilepicture: files, error: null });
      } else {
        console.log("ERROR");
        this.setState({ error: "You can only upload images!" });
      }
    } else {
      this.setState({ error: "You can only upload images!" });
    }
  };

  handleDropCompany = files => {
    console.log("DROP", files);
    if (files) {
      if (files.type.includes("image/")) {
        console.log(files);
        this.setState({ companypicture: files, error: null });
      } else {
        console.log("ERROR");
        this.setState({ error: "You can only upload images!" });
      }
    } else {
      this.setState({ error: "You can only upload images!" });
    }
  };

  componentLeft = stage => {
    switch (stage) {
      case 1:
        return (
          <div className="mapIcon">
            <i className="fal fa-map-pin" />
          </div>
        );
        break;
      case 2:
        return (
          <div className="mapIcon">
            <i className="fal fa-file-invoice-dollar" />
          </div>
        );
        break;
      case 3:
        return (
          <div className="mapIcon">
            <i className="fal fa-briefcase" />
          </div>
        );
        break;
      case 4:
        return (
          <div className="mapIcon">
            <i className="fal fa-user" />
          </div>
        );
        break;
      case 5:
        return (
          <div className="mapIcon">
            <i className="fal fa-arrow-square-right" />
          </div>
        );
        break;
      default:
    }
  };

  save = async stage => {
    await this.setState({ error: null });
    if (stage === 2) {
      await this.searchCompany();
    }
    console.log(this.state);
    if (stage === 2 && this.state.vatoption === 1) {
      try {
        const res = await this.props.checkVat({
          variables: { vat: this.state.vatnumber, cc: this.state.countryCode }
        });
      } catch {
        this.setState({ error: "Invalid VAT" });
        return;
      }
    }
    if (this.state.countryCode === this.props.country) {
      this.setState({
        country: countries.filter(c => c.value == this.props.country)[0].name,
        isEU: countries.filter(c => c.value == this.props.country)[0].isEU
      });
    }
    if (stage === 1 && !this.state.isEU && this.state.countryCode !== "OT") {
      this.setState({ show: 3, vatoption: 3 });
    } else {
      this.setState({ show: stage + 1 });
    }
  };

  skip = stage => {
    if (stage === 1) {
      this.setState({
        isEU: false,
        countryCode: null,
        country: null
      });
    }
    if (stage === 2) {
      this.searchCompany();
    }
    this.setState({ show: stage + 1 });
  };

  finalSave = async option => {
    console.log("FINALSAVE", this.state, this.props, option);
    try {
      await this.props.setupFinished({
        variables: {
          country: this.state.country,
          vatoption: this.state.vatoption,
          vatnumber: this.state.vatnumber,
          placeId: this.state.placeId,
          ownAdress: `
            street: ${this.state.street},
            zip: ${this.state.zip},
            city: ${this.state.city},
            country: ${this.state.country}
          `,
          username: this.state.name
        }
      });
      if (this.state.profilepicture) {
        console.log(this.state.profilepicture);
        await this.props.updateUserpicture({
          variables: { file: this.state.profilepicture }
        });
      }
      if (this.state.companypicture) {
        await this.props.updateCompanyLogo({
          variables: { file: this.state.companypicture }
        });
      }
      await this.props.client.query({ query: me, fetchPolicy: "network-only" });
      switch (option) {
        case 1:
          this.props.moveTo("team");
          return;
        case 2:
          this.props.moveTo("integrations");
          return;
        case 3:
          this.props.moveTo("dashboard");
          return;
        default:
      }
    } catch (err) {
      console.log(err);
    }
  };

  componentRight = stage => {
    switch (stage) {
      case 1:
        console.log("Props", this.props);
        const options = {
          enableHighAccuracy: true
        };
        if (navigator.geolocation) {
          console.log("NO GEO");
        }
        navigator.geolocation.getCurrentPosition(
          position => {
            // ...
            console.log("POS", position);
          },
          err => {
            // ...
            console.log("ERR", err);
          },
          options
        );
        return (
          <div className="formHolder">
            <h2>First of all: Where is your company located?</h2>
            <div className="selectHolder">
              {countries.map(({ value, name }) => (
                <div
                  className={`selectOption ${this.state.countryCode === value ? "active" : ""}`}
                  onClick={() => {
                    if (value === "OT") {
                      this.setState({
                        isEU: countries.filter(country => country.value == value)[0].isEU,
                        countryCode: value,
                        country: null
                      });
                    } else {
                      this.setState({
                        isEU: countries.filter(country => country.value == value)[0].isEU,
                        countryCode: value,
                        country: name
                      });
                    }
                  }}
                  key={value}>
                  <div className="selectCheck">
                    {this.state.countryCode === value ? <i className="fal fa-check" /> : ""}
                  </div>
                  <div>
                    {this.state.countryCode === "OT" && value === "OT" ? (
                      <div className="selectInputHolder">
                        <span className="selectSpan">Country:</span>
                        <input
                          className="selectInput"
                          autoFocus={true}
                          onChange={e => this.setState({ country: e.target.value })}
                        />
                      </div>
                    ) : (
                      name
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 2:
        return (
          <React.Fragment>
            <div className="formHolder">
              <h2>Do you have a VAT-number?</h2>
              <div className="selectHolder">
                <div
                  className={`selectOption ${this.state.vatoption === 1 ? "active" : ""}`}
                  onClick={() => this.setState({ vatoption: 1 })}>
                  <div className="selectCheck">
                    {this.state.vatoption === 1 ? <i className="fal fa-check" /> : ""}
                  </div>
                  {this.state.vatoption === 1 ? (
                    <div className="selectInputHolder">
                      <span className="selectSpan">Your VAT-number:</span>
                      <input
                        className="selectInput"
                        autoFocus={true}
                        onChange={e => this.setState({ vatnumber: e.target.value, error: null })}
                      />
                    </div>
                  ) : (
                    "Yes, I have my VAT-number."
                  )}
                </div>
                <div
                  className={`selectOption ${this.state.vatoption === 2 ? "active" : ""}`}
                  onClick={() => this.setState({ vatoption: 2, vatnumber: null, error: null })}>
                  <div className="selectCheck">
                    {this.state.vatoption === 2 ? <i className="fal fa-check" /> : ""}
                  </div>
                  <div>I don't have my VAT-number present.</div>
                </div>
                <div
                  className={`selectOption ${this.state.vatoption === 3 ? "active" : ""}`}
                  onClick={() => this.setState({ vatoption: 3, vatnumber: null, error: null })}>
                  <div className="selectCheck">
                    {this.state.vatoption === 3 ? <i className="fal fa-check" /> : ""}
                  </div>
                  <div>I can receive invoices without tax anyway.</div>
                </div>
              </div>
            </div>
            {this.state.error ? <div className="welcomeError">{this.state.error}</div> : ""}
          </React.Fragment>
        );
        break;

      case 3:
        return (
          <div className="formHolder">
            <h2>Choose your company?</h2>
            <div className="selectHolder">
              {this.state.predictions
                ? this.state.predictions!.data.searchAddressByCompanyName.map(element => (
                    <div
                      className={`selectOption ${
                        this.state.placeId === element.place_id ? "active" : ""
                      }`}
                      onClick={() => this.setState({ placeId: element.place_id, ownAddress: null })}
                      key={element.place_id}>
                      <div className="selectCheck">
                        {this.state.placeId === element.place_id ? (
                          <i className="fal fa-check" />
                        ) : (
                          ""
                        )}
                      </div>
                      <div>{element.description}</div>
                    </div>
                  ))
                : ""}
              <div
                className={`selectOption ${this.state.placeId === "OWN" ? "active" : ""}`}
                style={this.state.placeId === "OWN" ? { justifyContent: "space-around" } : {}}
                onClick={() => this.setState({ placeId: "OWN" })}>
                <div className="selectCheck">
                  {this.state.placeId === "OWN" ? <i className="fal fa-check" /> : ""}
                </div>
                {this.state.placeId === "OWN" ? (
                  <div
                    className="selectInputHolder"
                    style={{ padding: "30px", flexFlow: "column", maxWidth: "200px" }}>
                    <span className="selectSpan" style={{ fontSize: "15px" }}>
                      Company Address:
                    </span>
                    <div>
                      {/*<input
                        className="selectInput"
                        autoFocus={true}
                        onChange={e => this.setState({ ownAddress: e.target.value })}
                        placeholder="Street, Zip, City"
                      />
                      <GenericInputField
                        fieldClass="inputBoxField"
                        divClass=""
                        placeholder="Street / No."
                        onBlur={value => this.setState({ street: value })}
                      />
                      <GenericInputField
                        fieldClass="inputBoxField"
                        divClass=""
                        placeholder="City"
                        onBlur={value => this.setState({ city: value })}
                      />*/}
                      {/*Street Name and Number*/}
                      <div className="input-holder ">
                        <input
                          onFocus={() =>
                            this.setState({
                              streetfocus: true
                            })
                          }
                          id="street"
                          className="register-input"
                          value={this.state.street || ""}
                          onBlur={() => this.setState({ streetfocus: false })}
                          onChange={e => this.setState({ street: e.target.value })}
                        />
                        <label
                          className={
                            (this.state.street && this.state.street != "") || this.state.streetfocus
                              ? "flying-label"
                              : ""
                          }
                          htmlFor="street">
                          Street Name and Number
                        </label>
                      </div>

                      {/*Zip*/}
                      <div className="input-holder ">
                        <input
                          onFocus={() =>
                            this.setState({
                              zipfocus: true
                            })
                          }
                          id="zip"
                          className="register-input"
                          value={this.state.zip || ""}
                          onBlur={() => this.setState({ zipfocus: false })}
                          onChange={e => this.setState({ zip: e.target.value })}
                        />
                        <label
                          className={
                            (this.state.zip && this.state.zip != "") || this.state.zipfocus
                              ? "flying-label"
                              : ""
                          }
                          htmlFor="zip">
                          Zip Code
                        </label>
                      </div>

                      {/*City*/}
                      <div className="input-holder ">
                        <input
                          onFocus={() =>
                            this.setState({
                              cityfocus: true
                            })
                          }
                          id="city"
                          className="register-input"
                          value={this.state.city || ""}
                          onBlur={() => this.setState({ cityfocus: false })}
                          onChange={e => this.setState({ city: e.target.value })}
                        />
                        <label
                          className={
                            (this.state.city && this.state.city != "") || this.state.cityfocus
                              ? "flying-label"
                              : ""
                          }
                          htmlFor="city">
                          City
                        </label>
                      </div>

                      {/*Country*/}
                      <div className="input-holder ">
                        <input
                          onFocus={() =>
                            this.setState({
                              countryfocus: true
                            })
                          }
                          id="country"
                          className="register-input"
                          value={this.state.country || ""}
                          onBlur={() => this.setState({ countryfocus: false })}
                          onChange={e => this.setState({ country: e.target.value })}
                        />
                        <label
                          className={
                            (this.state.country && this.state.country != "") ||
                            this.state.countryfocus
                              ? "flying-label"
                              : ""
                          }
                          htmlFor="country">
                          Country
                        </label>
                      </div>
                    </div>
                  </div>
                ) : this.state.predictions &&
                  this.state.predictions!.data.searchAddressByCompanyName.length > 0 ? (
                  "None of the above."
                ) : (
                  "Insert your adress"
                )}
              </div>
            </div>
          </div>
        );
        break;

      case 4:
        return (
          <div className="formHolder">
            <h2>Let's personalize your VIPFY</h2>
            <div className="selectHolder">
              <div className="selectOption noSelect">
                <div className="selectInputHolder">
                  <span className="selectSpan">Your Name:</span>
                  <input
                    className="selectInput"
                    autoFocus={true}
                    onChange={e => this.setState({ name: e.target.value })}
                  />
                </div>
              </div>
              <div className="selectOption noSelect" style={{ marginTop: "20px" }}>
                <div className="selectInputHolder" style={{ marginBottom: "1px" }}>
                  <span className="selectSpan">Your Image:</span>
                  {this.state.error ? (
                    <div className="dropzoneWelcome">
                      <div className="previewUpload">
                        <div className="profileimagePlaceholder">
                          <i className="fal fa-exclamation" />
                        </div>
                        <div className="textUpload">{this.state.error}</div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <Dropzone
                    name={name}
                    accept="image/*"
                    type="file"
                    multiple={false}
                    className="dropzoneWelcome"
                    onDrop={([fileToUpload]) => this.handleDrop(fileToUpload)}>
                    <div className="previewUpload">
                      {this.state.profilepicture ? (
                        <React.Fragment>
                          <img
                            alt={this.state.profilepicture.name}
                            height="100px"
                            width="100px"
                            className="img-circle"
                            src={this.state.profilepicture.preview}
                          />
                          <div
                            className="deleteProfileimage"
                            onClick={e => {
                              e.preventDefault();
                              this.setState({ profilepicture: null });
                            }}>
                            <i
                              className="fal fa-trash-alt"
                              onClick={e => {
                                e.preventDefault();
                                this.setState({ profilepicture: null });
                              }}
                            />
                          </div>
                        </React.Fragment>
                      ) : (
                        <div className="profileimagePlaceholder">
                          <i className="fal fa-user" />
                        </div>
                      )}
                      <div className="textUpload">Click here or drop an image</div>
                    </div>
                  </Dropzone>
                </div>
              </div>

              <div className="selectOption noSelect" style={{ marginTop: "50px" }}>
                <div className="selectInputHolder" style={{ marginBottom: "1px" }}>
                  <span className="selectSpan">Your Company Logo:</span>
                  {this.state.error ? (
                    <div className="dropzoneWelcome">
                      <div className="previewUpload">
                        <div className="profileimagePlaceholder">
                          <i className="fal fa-exclamation" />
                        </div>
                        <div className="textUpload">{this.state.error}</div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <Dropzone
                    name={name}
                    accept="image/*"
                    type="file"
                    multiple={false}
                    className="dropzoneWelcome"
                    onDrop={([fileToUpload]) => this.handleDropCompany(fileToUpload)}>
                    <div className="previewUpload">
                      {this.state.companypicture ? (
                        <React.Fragment>
                          <img
                            alt={this.state.companypicture.name}
                            height="100px"
                            width="100px"
                            className="img-circle"
                            src={this.state.companypicture.preview}
                          />
                          <div
                            className="deleteProfileimage"
                            onClick={e => {
                              e.preventDefault();
                              this.setState({ companypicture: null });
                            }}>
                            <i
                              className="fal fa-trash-alt"
                              onClick={e => {
                                e.preventDefault();
                                this.setState({ companypicture: null });
                              }}
                            />
                          </div>
                        </React.Fragment>
                      ) : (
                        <div className="profileimagePlaceholder">
                          <i className="fal fa-briefcase" />
                        </div>
                      )}
                      <div className="textUpload">Click here or drop an logo</div>
                    </div>
                  </Dropzone>
                </div>
              </div>
            </div>
          </div>
        );
        break;

      case 5:
        return (
          <div className="formHolder">
            <h2>How do you want to start</h2>
            <div className="selectHolder">
              <div className="selectOption noSelect">
                <div className="selectInputHolder" style={{ width: "400px" }}>
                  <div className="dropzoneWelcome nextWelcome" onClick={() => this.finalSave(1)}>
                    <div className="previewUpload">
                      <div className="profileimagePlaceholder">
                        <i className="fal fa-users-cog" />
                      </div>
                      <div className="textUpload">Add addional users to your team</div>
                    </div>
                  </div>
                  <div className="dropzoneWelcome nextWelcome" onClick={() => this.finalSave(2)}>
                    <div className="previewUpload">
                      <div className="profileimagePlaceholder">
                        <i className="fal fa-shapes" />
                      </div>
                      <div className="textUpload">Add your existing accounts to your profile</div>
                    </div>
                  </div>
                  <div className="dropzoneWelcome nextWelcome" onClick={() => this.finalSave(3)}>
                    <div className="previewUpload">
                      <div className="profileimagePlaceholder">
                        <i className="fal fa-home" />
                      </div>
                      <div className="textUpload">Go to your dashboard and take a look around</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      default:
    }
  };

  savebutton = stage => {
    switch (stage) {
      case 1:
        return this.state.country ||
          (this.state.countryCode === this.props.country && this.props.country !== null) ? (
          <button
            className="naked-button genericButton sameWidthButton"
            onClick={() => this.save(this.state.show)}>
            Next
          </button>
        ) : (
          <div className="sameWidthButton genericButton buttonDisabled">Next</div>
        );
      case 2:
        return this.state.vatoption === 2 ||
          this.state.vatoption === 3 ||
          (this.state.vatoption === 1 && this.state.vatnumber !== null) ? (
          <button
            className="naked-button genericButton sameWidthButton"
            onClick={() => this.save(this.state.show)}>
            Next
          </button>
        ) : (
          <div className="sameWidthButton genericButton buttonDisabled">Next</div>
        );
      case 3:
        return (this.state.placeId !== null && this.state.placeId !== "OWN") ||
          (this.state.placeId === "OWN" &&
            this.state.street !== null &&
            this.state.zip !== null &&
            this.state.city !== null &&
            this.state.country !== null) ? (
          <button
            className="naked-button genericButton sameWidthButton"
            onClick={() => this.save(this.state.show)}>
            Next
          </button>
        ) : (
          <div className="sameWidthButton genericButton buttonDisabled">Next</div>
        );
      case 4:
        return (
          <button
            className="naked-button genericButton sameWidthButton"
            onClick={() => this.finalSave(3)}>
            Finish Setup
          </button>
        );
      case 5:
        return;
        break;
      default:
        return (
          <button
            className="naked-button genericButton sameWidthButton"
            onClick={() => this.save(this.state.show)}>
            Next
          </button>
        );
    }
  };

  render() {
    return (
      <div className="welcomeBackground">
        <div className="welcomeModal">
          <div className="left">{this.componentLeft(this.state.show)}</div>
          <div className="right">
            <div className="logo" />
            {this.componentRight(this.state.show)}
            <div className="welcomeButtons">
              {this.state.show === 4 ? (
                ""
              ) : (
                <button
                  className="naked-button genericButton sameWidthButton"
                  onClick={() => this.skip(this.state.show)}>
                  Skip
                </button>
              )}
              {this.savebutton(this.state.show)}
            </div>
          </div>
          <div className="welcomeProgress">
            <div
              className="element"
              style={
                this.state.show === 1
                  ? { backgroundColor: "#357AA5" }
                  : this.state.show > 1
                  ? { backgroundColor: "#357AA5" }
                  : {}
              }
            />
            <div
              className="element"
              style={
                this.state.show === 2
                  ? { backgroundColor: "#357AA5" }
                  : this.state.show > 2
                  ? { backgroundColor: "#357AA5" }
                  : {}
              }
            />
            <div
              className="element"
              style={
                this.state.show === 3
                  ? { backgroundColor: "#357AA5" }
                  : this.state.show > 3
                  ? { backgroundColor: "#357AA5" }
                  : {}
              }
            />
            <div
              className="element"
              style={
                this.state.show === 4
                  ? { backgroundColor: "#357AA5" }
                  : this.state.show > 4
                  ? { backgroundColor: "#357AA5" }
                  : {}
              }
            />
            {/*<div
              className="element"
              style={
                this.state.show === 5
                  ? { backgroundColor: "#357AA5" }
                  : this.state.show > 5
                  ? { backgroundColor: "#357AA5" }
                  : {}
              }
            />*/}
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CHECK_VAT, { name: "checkVat" }),
  graphql(SETUP_FINISHED, { name: "setupFinished" }),
  graphql(UPDATE_PIC, { name: "updateUserpicture" }),
  graphql(UPDATE_LOGO, { name: "updateCompanyLogo" }),
  withApollo
)(Welcome);
