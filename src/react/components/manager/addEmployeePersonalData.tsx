import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import Dropzone from "react-dropzone";
import EmployeeGerneralDataAdd from "./universal/adding/employeeGeneralDataAdd";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import { compose, graphql, withApollo } from "react-apollo";
import gql from "graphql-tag";
import { parseName } from "humanparser";
import { randomPassword } from "../../common/passwordgen";
import { filterError, AppContext } from "../../common/functions";
import * as crypto from "../../common/crypto";
import { computePasswordScore } from "../../common/passwords";

interface Props {
  close: Function;
  continue: Function;
  addpersonal?: any;
  heading?: string;
  createEmployee: Function;
  isadmin?: boolean;
  client: any;
}

interface State {
  name: string;
  birthday: string;
  hiredate: string;
  street: string;
  zip: string;
  city: string;
  pphone1: string;
  pphone2: string;
  position: string;
  wmail1: string;
  wmail2: string;
  wphone1: string;
  wphone2: string;
  confirm: Boolean;
  saving: Boolean;
  success: Boolean;
  unitid: number | null;
  parsedName: any;
  error: String | null;
  picture: File | null;
  employee: any;
}

const CREATE_EMPLOYEE = gql`
  mutation createEmployee(
    $name: HumanName!
    $emails: [EmailInput!]!
    $birthday: Date
    $hiredate: Date
    $address: AddressInput
    $position: String
    $phones: [PhoneInput]
    $password: String
    $needpasswordchange: Boolean
    $picture: Upload
    $passkey: String!
    $passwordMetrics: PasswordMetricsInput!
    $personalKey: KeyInput!
    $passwordsalt: String!
  ) {
    createEmployee(
      name: $name
      emails: $emails
      file: $picture
      birthday: $birthday
      hiredate: $hiredate
      address: $address
      position: $position
      phones: $phones
      password: $password
      needpasswordchange: $needpasswordchange
      passkey: $passkey
      passwordMetrics: $passwordMetrics
      personalKey: $personalKey
      passwordsalt: $passwordsalt
    ) {
      id
      profilepicture
      firstname
      middlename
      lastname
      title
      suffix
    }
  }
`;

class AddEmployeePersonalData extends React.Component<Props, State> {
  state = {
    name: (this.props.addpersonal && this.props.addpersonal.name) || "",
    birthday: (this.props.addpersonal && this.props.addpersonal.birthday) || "",
    hiredate: (this.props.addpersonal && this.props.addpersonal.hiredate) || "",
    street: (this.props.addpersonal && this.props.addpersonal.street) || "",
    zip: (this.props.addpersonal && this.props.addpersonal.zip) || "",
    city: (this.props.addpersonal && this.props.addpersonal.city) || "",
    pphone1: (this.props.addpersonal && this.props.addpersonal.pphone1) || "",
    pphone2: (this.props.addpersonal && this.props.addpersonal.pphone2) || "",
    position: (this.props.addpersonal && this.props.addpersonal.position) || "",
    wmail1: (this.props.addpersonal && this.props.addpersonal.wmail1) || "",
    wmail2: (this.props.addpersonal && this.props.addpersonal.wmail2) || "",
    wphone1: (this.props.addpersonal && this.props.addpersonal.wphone1) || "",
    wphone2: (this.props.addpersonal && this.props.addpersonal.wphone2) || "",
    confirm: false,
    saving: false,
    success: true,
    unitid: null,
    parsedName: null,
    error: null,
    picture: null,
    employee: null
  };

  handleConfirm() {
    if (this.state.confirm) {
      this.setState({ saving: true, confirm: false });
    }
  }

  handleCreate() {
    if (this.props.addpersonal && this.props.addpersonal.unitid) {
      this.props.continue(this.state);
    } else {
      this.setState({ confirm: true });
    }
  }

  listenKeyboard = e => {
    const { name, wmail1 } = this.state;
    this.handleConfirm();
    if (e.key === "Escape" || e.keyCode === 27) {
      this.props.close();
    } else if (
      !(
        e.target &&
        e.target.id &&
        [
          "name",
          "wmail1",
          "wmail2",
          "birthday",
          "hiredate",
          "pphone1",
          "pphone2",
          "position",
          "wphone1",
          "wphone2"
        ].includes(e.target.id)
      )
    ) {
      return; // Check if one of the Textfields is focused
    } else if (
      (e.key === "Enter" || e.keyCode === 13) &&
      name &&
      wmail1 &&
      e.srcElement.textContent != "Cancel"
    ) {
      this.handleCreate();
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.listenKeyboard, true);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.listenKeyboard, true);
  }

  render() {
    return (
      <React.Fragment>
        <h1>{this.props.heading || "Add Employee"}</h1>
        <div className="deleteContent" style={{ overflowY: "scroll" }}>
          <EmployeeGerneralDataAdd
            addpersonal={this.props.addpersonal}
            setOuterState={s => this.setState(s)}
            isadmin={this.props.isadmin}
          />

          <div className="buttonsPopup" style={{ justifyContent: "space-between" }}>
            <AppContext.Consumer>
              {({ addRenderElement }) => (
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.props.close()}
                  innerRef={el => addRenderElement({ key: "cancel", element: el })}
                />
              )}
            </AppContext.Consumer>
            <AppContext.Consumer>
              {({ addRenderElement }) => (
                <UniversalButton
                  label="Continue"
                  type="high"
                  disabled={
                    this.state.name == "" ||
                    this.state.wmail1 == "" ||
                    !this.state.wmail1.includes("@")
                  }
                  onClick={() => this.handleCreate()}
                  innerRef={el => addRenderElement({ key: "continueAdd", element: el })}
                />
              )}
            </AppContext.Consumer>
          </div>
        </div>
        {this.state.confirm && (
          <PopupBase small={true} close={() => this.setState({ confirm: false })}>
            Do you really want to create an Employee called {this.state.name}?
            <UniversalButton label="Cancel" type="low" closingPopup={true} />
            <AppContext.Consumer>
              {({ addRenderElement }) => (
                <UniversalButton
                  label="Confirm"
                  type="high"
                  onClick={() => this.handleConfirm()}
                  /*innerRef={el => addRenderElement({ key: "saved", element: el })}*/
                />
              )}
            </AppContext.Consumer>
          </PopupBase>
        )}
        {this.state.saving && (
          <PopupSelfSaving
            savingmessage="Employee is being created"
            savedmessage="Employee has been created"
            errormessage={this.state.error || "Something went wrong. Please try again"}
            closeFunction={() =>
              this.state.success
                ? this.props.continue(this.state)
                : this.setState({ saving: false })
            }
            saveFunction={async () => {
              const {
                name,
                pphone1,
                pphone2,
                wmail1,
                wmail2,
                wphone1,
                wphone2,
                confirm,
                saving,
                success,
                hiredate,
                birthday,
                unitid,
                ...state
              } = this.state;
              const parsedName = parseName(name);
              try {
                // TODO VIP-960 make these parameters configurable
                const password = "testaccoun";
                const emailPassword = false;
                const needpasswordchange = false;

                const salt = await crypto.getRandomSalt();
                const { loginkey, encryptionkey1 } = await crypto.hashPassword(
                  this.props.client,
                  wmail1,
                  password,
                  salt
                );
                const passwordMetrics = {
                  passwordlength: password.length,
                  passwordstrength: computePasswordScore(password)
                };

                const personalKey = await crypto.generatePersonalKeypair(encryptionkey1);

                const unitid = await this.props.createEmployee({
                  variables: {
                    ...state,
                    name: {
                      title: parsedName.salutation || "",
                      firstname: parsedName.firstName || "",
                      middlename: parsedName.middleName || "",
                      lastname: parsedName.lastName || "",
                      suffix: parsedName.suffix || ""
                    },
                    phones: [
                      { number: pphone1, tags: ["private"] },
                      { number: pphone2, tags: ["private"] },
                      { number: wphone1, tags: ["work"] },
                      { number: wphone2, tags: ["work"] }
                    ],
                    emails: [{ email: wmail1 }, { email: wmail2 }],
                    password: emailPassword ? password : null,
                    hiredate: hiredate != "" ? hiredate : null,
                    birthday: birthday != "" ? birthday : null,
                    passkey: loginkey.toString("hex"),
                    passwordMetrics,
                    personalKey,
                    passwordsalt: salt,
                    needpasswordchange
                  }
                });
                this.setState({
                  success: true,
                  unitid: unitid.data.createEmployee.id,
                  parsedName: {
                    title: parsedName.salutation || "",
                    firstname: parsedName.firstName || "",
                    middlename: parsedName.middleName || "",
                    lastname: parsedName.lastName || "",
                    suffix: parsedName.suffix || ""
                  },
                  employee: unitid.data.createEmployee
                });
              } catch (err) {
                console.log("ERR", err);
                this.setState({ success: false, error: filterError(err) });
                throw new Error(err.message);
              }
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
export default compose(
  graphql(CREATE_EMPLOYEE, { name: "createEmployee" }),
  withApollo
)(AddEmployeePersonalData);
