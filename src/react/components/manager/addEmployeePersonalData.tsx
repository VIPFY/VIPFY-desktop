import * as React from "react";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import EmployeeGerneralDataAdd from "./universal/adding/employeeGeneralDataAdd";
import PopupBase from "../../popups/universalPopups/popupBase";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { parseName } from "humanparser";
import { randomPassword } from "../../common/passwordgen";

interface Props {
  close: Function;
  continue: Function;
  addpersonal: any;
  heading?: string;
  createEmployee: Function;
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
}

const CREATE_EMPLOYEE = gql`
  mutation createEmployee09(
    $name: HumanName!
    $emails: [EmailInput!]!
    $file: Upload
    $birthday: Date
    $hiredate: Date
    $address: AddressInput
    $position: String
    $phones: [PhoneInput]
    $password: String!
    $needpasswordchange: Boolean
  ) {
    createEmployee09(
      name: $name
      emails: $emails
      file: $file
      birthday: $birthday
      hiredate: $hiredate
      address: $address
      position: $position
      phones: $phones
      password: $password
      needpasswordchange: $needpasswordchange
    )
  }
`;

class AddEmployeePersonalData extends React.Component<Props, State> {
  state = {
    name: this.props.addpersonal.name || "",
    birthday: this.props.addpersonal.birthday || "",
    hiredate: this.props.addpersonal.hiredate || "",
    street: this.props.addpersonal.street || "",
    zip: this.props.addpersonal.zip || "",
    city: this.props.addpersonal.city || "",
    pphone1: this.props.addpersonal.pphone1 || "",
    pphone2: this.props.addpersonal.pphone2 || "",
    position: this.props.addpersonal.position || "",
    wmail1: this.props.addpersonal.wmail1 || "",
    wmail2: this.props.addpersonal.wmail2 || "",
    wphone1: this.props.addpersonal.wphone1 || "",
    wphone2: this.props.addpersonal.wphone2 || "",
    confirm: false,
    saving: false,
    success: true,
    unitid: "1260",
    parsedName: {
      title: "Mr.",
      firstname: "Pascal",
      middlename: "",
      lastname: "Beutlin",
      suffix: ""
    }
  };

  render() {
    console.log("AEPD", this.props, this.state);
    return (
      <React.Fragment>
        <span>
          <span className="bHeading">{this.props.heading || "Add Employee"}</span>
          {/*<span className="mHeading">
            > <span className="active">Personal Data</span> > Teams > Services
    </span>*/}
        </span>
        <EmployeeGerneralDataAdd
          addpersonal={this.props.addpersonal}
          setOuterState={s => this.setState(s)}
        />
        <div className="buttonsPopup">
          <UniversalButton label="Cancel" type="low" onClick={() => this.props.close()} />
          <div className="buttonSeperator" />
          <UniversalButton
            label="Continue"
            type="high"
            disabled={
              this.state.name == "" || this.state.wmail1 == "" || !this.state.wmail1.includes("@")
            }
            onClick={() =>
              this.props.addpersonal.unitid
                ? this.props.continue(this.state)
                : this.setState({ confirm: true })
            }
          />
        </div>
        {this.state.confirm && (
          <PopupBase small={true} close={() => this.setState({ confirm: false })}>
            Do you really want to create an Employee called {this.state.name}?
            <UniversalButton label="Cancel" type="low" closingPopup={true} />
            <UniversalButton
              label="Confirm"
              type="high"
              onClick={() => this.setState({ saving: true, confirm: false })}
            />
          </PopupBase>
        )}
        {this.state.saving && (
          <PopupSelfSaving
            savingmessage="Employee is being created"
            savedmessage="Employee has been created"
            errormessage="Something went wrong. Please try again"
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
                    password: await randomPassword(),
                    hiredate: hiredate != "" ? hiredate : null,
                    birthday: birthday != "" ? birthday : null
                  }
                });
                console.log("SUCCESS", unitid);
                this.setState({
                  success: true,
                  unitid: unitid.data.createEmployee09,
                  parsedName: {
                    title: parsedName.salutation || "",
                    firstname: parsedName.firstName || "",
                    middlename: parsedName.middleName || "",
                    lastname: parsedName.lastName || "",
                    suffix: parsedName.suffix || ""
                  }
                });
              } catch (err) {
                console.log("ERR");
                this.setState({ success: false });
                throw new Error(err.message);
              }
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
export default compose(graphql(CREATE_EMPLOYEE, { name: "createEmployee" }))(
  AddEmployeePersonalData
);
