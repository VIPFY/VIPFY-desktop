import * as React from "react";
import moment = require("moment");
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import { Mutation, compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import UniversalDropDownInput from "../universalForms/universalDropdownInput";
import DatePicker from "../../common/DatePicker";
import { parseName } from "humanparser";

const UPDATE_DATA = gql`
  mutation updateEmployee($user: EmployeeInput!) {
    updateEmployee(user: $user) {
      id
      firstname
      middlename
      lastname
      birthday
      hiredate
      position
      emails {
        email
      }
      addresses {
        id
        country
        address
      }
      phones {
        id
        number
        tags
      }
    }
  }
`;
interface Props {
  querydata: any;
  createEmail: Function;
updateEmail: Function;
deleteEmail: Function;
}

interface State {
  popupline1: Boolean;
  popupline2: Boolean;
  name: string;
  birthday: number;
  street: string;
  zip: string;
  city: string;
  country: string;
  phone1: string;
  phone2: string;
  updateing: Boolean;
  hiredate: string;
  position: string;
  email: string;
  email2: string;
  workPhone: string;
  workPhone2: string;
  error: string | null;
  edit: Object | null;
  editvalue: String | null;
  editvalueArray: any[];
}

const CREATE_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean) {
    createEmail(emailData: $emailData, forCompany: $company) {
      email
      description
      priority
      verified
      tags
    }
  }
`;

const UPDATE_EMAIL = gql`
  mutation onUpdateEmail($email: String!, $emailData: EmailUpdateInput!) {
    updateEmail08(email: $email, emailData: $emailData) {
      email
      description
    }
  }
`;

const DELETE_EMAIL = gql`
  mutation onDeleteEmail($email: String!, $company: Boolean) {
    deleteEmail(email: $email, forCompany: $company) {
      ok
    }
  }
`;

class PersonalDetails extends React.Component<Props, State> {
  state = {
    popupline1: false,
    popupline2: false,
    name: `${this.props.querydata.firstname || ""} ${this.props.querydata.lastname || ""}`,
    birthday: this.props.querydata.birthday,
    street:
      this.props.querydata.addresses[0] &&
      this.props.querydata.addresses[0].address &&
      this.props.querydata.addresses[0].address.street,
    zip:
      this.props.querydata.addresses[0] &&
      this.props.querydata.addresses[0].address &&
      this.props.querydata.addresses[0].address.zip,
    city:
      this.props.querydata.addresses[0] &&
      this.props.querydata.addresses[0].address &&
      this.props.querydata.addresses[0].address.city,
    country:
      this.props.querydata.addresses[0] &&
      this.props.querydata.addresses[0].address &&
      this.props.querydata.addresses[0].country,
    phone1:
      this.props.querydata.privatePhones &&
      this.props.querydata.privatePhones[0] &&
      this.props.querydata.privatePhones[0].number,
    phone2:
      this.props.querydata.privatePhones &&
      this.props.querydata.privatePhones[1] &&
      this.props.querydata.privatePhones[1].number,
    updateing: false,
    hiredate: this.props.querydata.hiredate,
    position: this.props.querydata.position,
    email: this.props.querydata.email,
    email2: this.props.querydata.email2,
    workPhone: this.props.querydata.workPhone,
    workPhone2: this.props.querydata.workPhone2,
    error: null,
    edit: null,
    editvalue: null,
    editvalueArray: []
  };

  generateName(first, middle, last) {
    let name = first;
    if (!name) {
      name = middle;
    } else if (middle) {
      name += " ";
      name += middle;
    }
    if (!name) {
      name = last;
    } else if (last) {
      name += " ";
      name += last;
    }
    return name;
  }

  printEditForm() {
    switch (this.state.edit.id) {
      case "emails":
        const emailforms: JSX.Element[] = [];
        console.log("EMAILS", this.props, this.state);
        if (Math.max(this.props.querydata.emails.length, this.state.editvalueArray.length) > 0) {
          const emails = this.props.querydata.emails.map((email, index) => {
            if (this.state.editvalueArray[index]) {
              return this.state.editvalueArray[index];
            } else {
              return email;
            }
          });
          this.state.editvalueArray.forEach(
            (email, index) => index >= this.props.querydata.emails.length && emails.push(email)
          );
          console.log("ALLMAILS", emails);
          let newemail = false;
          emails.forEach((email, index) => {
            console.log("THIS MAIL", email, index);

            if (index > 0 && !email.emaildeleted) {
              emailforms.push(<div className="fieldsSeperator" />);
            }
            newemail =
              newemail || ((!email.emaildeleted && email.email == null) || email.email == "");
            emailforms.push(
              <UniversalTextInput
                id={`${this.state.edit.id}-${email.oldemail || email.email}`}
                label={this.state.edit.label}
                livevalue={v =>
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = {
                      email: v,
                      oldemail: email.oldemail || email.email,
                      newemail: email.newemail
                    };
                    return { editvalueArray };
                  })
                }
                startvalue={email.email}
                deleteFunction={() => {
                  console.log("DELETE", index, this.state.editvalueArray);
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = { emaildeleted: true, oldemail: email.email };
                    return { editvalueArray };
                  });
                }}
                style={email.emaildeleted && { display: "none" }}
              />
            );
          });
          if (!newemail) {
            emailforms.push(
              <UniversalButton
                type="low"
                label="Add Email"
                onClick={() =>
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[
                      Math.max(editvalueArray.length, this.props.querydata.emails.length)
                    ] = {
                      email: null,
                      oldemail: Math.max(editvalueArray.length, this.props.querydata.emails.length),
                      newemail: true
                    };
                    return { editvalueArray };
                  })
                }
              />
            );
          }
        }
        return emailforms;
        break;

      default:
        return (
          <UniversalTextInput
            id={this.state.edit.id}
            label={this.state.edit.label}
            livevalue={v => this.setState({ editvalue: v })}
            startvalue={this.state.edit.startvalue}
            type={this.state.edit.type}
          />
        );
    }
  }

  render() {
    const querydata = this.props.querydata;
    return (
      <React.Fragment>
        <div
          className="tableRowShow"
          style={{ height: "80px", width: "100%" }}
          //onClick={() => this.setState({ popupline1: true })}
        >
          <div className="tableMain" style={{ width: "100%" }}>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "name",
                    label: "Name",
                    startvalue: this.generateName(
                      querydata.firstname,
                      querydata.middlename,
                      querydata.lastname
                    )
                  }
                })
              }>
              <h1>Name</h1>
              <h2>
                {this.generateName(querydata.firstname, querydata.middlename, querydata.lastname)}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "birthday",
                    label: "Birthday",
                    startvalue: querydata.birthday
                      ? moment(querydata.birthday - 0).format("YYYY-MM-DD")
                      : " ",
                    type: "date"
                  }
                })
              }>
              <h1>Birthday</h1>
              <h2>
                {querydata.birthday
                  ? moment(querydata.birthday - 0).format("DD.MM.YYYY")
                  : "Not set"}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
            <div className="tableColumnSmall">
              {/*<h1>Address</h1>
              <h2>
                {querydata.addresses[0] &&
                  querydata.addresses[0].address &&
                  querydata.addresses[0].address.street}
              </h2>
              <h2 className="second">
                {querydata.addresses[0] &&
                  querydata.addresses[0].address &&
                  querydata.addresses[0].address.zip}{" "}
                {querydata.addresses[0] &&
                  querydata.addresses[0].address &&
                  querydata.addresses[0].address.city}
                </h2>*/}
            </div>
            <div className="tableColumnSmall editable">
              <h1>Private Phone</h1>
              <h2>
                {querydata.privatePhones &&
                  querydata.privatePhones[0] &&
                  querydata.privatePhones[0].number}
              </h2>
              <h2 className="second">
                {querydata.privatePhones &&
                  querydata.privatePhones[1] &&
                  querydata.privatePhones[1].number}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="tableRowShow"
          style={{ height: "80px", width: "100%" }}
          // onClick={() => this.setState({ popupline2: true })}
        >
          <div className="tableMain" style={{ width: "100%" }}>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "hiredate",
                    label: "Hiredate",
                    startvalue: querydata.hiredate
                      ? moment(querydata.hiredate - 0).format("YYYY-MM-DD")
                      : " ",
                    type: "date"
                  }
                })
              }>
              <h1>Hiredate</h1>
              <h2>
                {querydata.hiredate
                  ? moment(querydata.hiredate - 0).format("DD.MM.YYYY")
                  : "Not set"}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "position",
                    label: "Position",
                    startvalue: querydata.position
                  }
                })
              }>
              <h1>Position</h1>
              <h2>{querydata.position}</h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "emails",
                    label: "Email",
                    startvalue: querydata.emails
                  }
                })
              }>
              <h1>Workmail</h1>
              <h2>{querydata.emails && querydata.emails[0] && querydata.emails[0].email}</h2>
              <h2 className="second">
                {querydata.emails && querydata.emails[1] && querydata.emails[1].email}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
            <div className="tableColumnSmall editable">
              <h1>Work Phone</h1>
              <h2>
                {querydata.workPhones && querydata.workPhones[0] && querydata.workPhones[0].number}
              </h2>
              <h2 className="second">
                {querydata.workPhones && querydata.workPhones[1] && querydata.workPhones[1].number}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pencil editbuttons" />
              </div>
            </div>
          </div>
        </div>
        {this.state.edit && (
          <Mutation mutation={UPDATE_DATA}>
            {updateEmployee => (
              <PopupBase small={true} buttonStyles={{ justifyContent: "space-between" }}>
                <h2 className="boldHeading">
                  Edit Personal Data of{" "}
                  {this.generateName(querydata.firstname, querydata.middlename, querydata.lastname)}
                </h2>
                <div>{this.printEditForm()}</div>
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.setState({ edit: null })}
                />
                <UniversalButton
                  label="Save"
                  type="high"
                  onClick={async () => {
                    try {
                      this.setState({ updateing: true });
                      switch (this.state.edit!.id) {
                        case "name":
                          const parsedName = parseName(this.state.editvalue);
                          await updateEmployee({
                            variables: {
                              user: {
                                id: querydata.id,
                                firstname: parsedName.firstName,
                                middlename: parsedName.middleName || "",
                                lastname: parsedName.lastName || ""
                              }
                            }
                          });
                          break;

                        case "emails":
                          this.state.editvalueArray.forEach(edit => {
                            console.log("SAVE", edit)
                            if (edit){
                              if (edit.newemail && !edit.emaildeleted && edit.email && edit.email.includes("@")){
                                //new valid email
                                await createEmail
                              }
                            }
                          })
                        /*await updateEmployee({
                          variables: {
                            user: {
                              id: querydata.id,
                              emails: this.state.editvalue
                            }
                          }
                        });*/:
                          console.log("Emails", this.state.editvalue);
                          break;

                        default:
                          await updateEmployee({
                            variables: {
                              user: {
                                id: querydata.id,
                                [this.state.edit!.id]: this.state.editvalue
                                  ? this.state.editvalue
                                  : null
                              }
                            }
                          });
                          break;
                      }
                      this.setState({ edit: null, updateing: false, editvalue: null });
                    } catch (err) {
                      //this.setState({ popupline1: false, updateting: false });
                      this.setState({ updateing: false, error: err });
                      console.log("err", err);
                    }
                  }}
                />
                {this.state.updateing ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <i className="fal fa-cog fa-spin" />
                    <span>Saving</span>
                  </PopupBase>
                ) : (
                  ""
                )}
                {this.state.error ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <span>Something went wrong :( Please try again or contact support</span>
                    <UniversalButton
                      type="high"
                      label="Ok"
                      onClick={() => this.setState({ error: null })}
                    />
                  </PopupBase>
                ) : (
                  ""
                )}
              </PopupBase>
            )}
          </Mutation>
        )}
        {/*this.state.popupline1 ? (
          <Mutation mutation={UPDATE_DATA}>
            {updateEmployee => (
              <PopupBase small={true} buttonStyles={{ justifyContent: "space-between" }}>
                <h2 className="boldHeading">
                  Edit Personal Data of {querydata.firstname} {querydata.lastname}
                </h2>
                <div>
                  <UniversalTextInput
                    id="name"
                    label="Name"
                    livevalue={v => this.setState({ name: v })}
                    startvalue={`${querydata.firstname || ""} ${querydata.lastname || ""}`}
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="birthday"
                    label="Birthday"
                    type="date"
                    livevalue={v => this.setState({ birthday: v })}
                    startvalue={
                      querydata.birthday ? moment(querydata.birthday - 0).format("YYYY-MM-DD") : " "
                    }
                  />
                  {/*<div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="street"
                    label="Street / Number"
                    livevalue={v => this.setState({ street: v })}
                    startvalue={
                      querydata.addresses[0] &&
                      querydata.addresses[0].address &&
                      querydata.addresses[0].address.street
                    }
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="zip"
                    label="Zip"
                    livevalue={v => this.setState({ zip: v })}
                    startvalue={
                      querydata.addresses[0] &&
                      querydata.addresses[0].address &&
                      querydata.addresses[0].address.zip
                    }
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="city"
                    label="City"
                    livevalue={v => this.setState({ city: v })}
                    startvalue={
                      querydata.addresses[0] &&
                      querydata.addresses[0].address &&
                      querydata.addresses[0].address.city
                    }
                  />
                  <div className="fieldsSeperator" />
                  <UniversalDropDownInput
                    id="country"
                    label="Country"
                    livecode={v => this.setState({ country: v })}
                    startvalue={
                      querydata.addresses[0] &&
                      querydata.addresses[0].address &&
                      querydata.addresses[0].country
                    }
                  /> *&/}
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="phone"
                    label="Private Phone"
                    livevalue={v => this.setState({ phone1: v })}
                    startvalue={
                      querydata.privatePhones &&
                      querydata.privatePhones[0] &&
                      querydata.privatePhones[0].number
                    }
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="phone2"
                    label="Private Phone 2"
                    disabled={this.state.phone1 == ""}
                    livevalue={v => this.setState({ phone2: v })}
                    startvalue={
                      querydata.privatePhones &&
                      querydata.privatePhones[1] &&
                      querydata.privatePhones[1].number
                    }
                  />
                </div>
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.setState({ popupline1: false })}
                />
                <UniversalButton
                  label="Save"
                  type="high"
                  onClick={async () => {
                    const parsedName = parseName(this.state.name);
                    try {
                      this.setState({ updateing: true });
                      await updateEmployee({
                        variables: {
                          user: {
                            id: querydata.id,
                            firstname: parsedName.firstName,
                            middlename: parsedName.middleName || "",
                            lastname: parsedName.lastName || "",
                            birthday: this.state.birthday ? this.state.birthday : null,
                            /*address: Object.assign(
                              {},
                              querydata.addresses[0] && querydata.addresses[0].id
                                ? { id: querydata.addresses[0].id }
                                : {},
                              { street: this.state.street },
                              { zip: this.state.zip },
                              { city: this.state.city },
                              { country: this.state.country }
                            ),*&/
                            phone: Object.assign(
                              {},
                              querydata.privatePhones &&
                                querydata.privatePhones[0] &&
                                querydata.privatePhones[0].id
                                ? { id: querydata.privatePhones[0].id }
                                : {},
                              { number: this.state.phone1 || "" }
                            ),
                            phone2: Object.assign(
                              {},
                              querydata.privatePhones &&
                                querydata.privatePhones[1] &&
                                querydata.privatePhones[1].id
                                ? { id: querydata.privatePhones[1].id }
                                : {},
                              { number: this.state.phone2 || "" }
                            )
                          }
                        }
                      });
                      this.setState({ popupline1: false, updateing: false });
                    } catch (err) {
                      //this.setState({ popupline1: false, updateting: false });
                      this.setState({ updateing: false, error: err });
                      console.log("err", err);
                    }
                  }}
                />
                {this.state.updateing ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <i className="fal fa-cog fa-spin" />
                    <span>Saving</span>
                  </PopupBase>
                ) : (
                  ""
                )}
                {this.state.error ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <span>Something went wrong :( Please try again or contact support</span>
                    <UniversalButton
                      type="high"
                      label="Ok"
                      onClick={() => this.setState({ error: null })}
                    />
                  </PopupBase>
                ) : (
                  ""
                )}
              </PopupBase>
            )}
          </Mutation>
        ) : (
          ""
        )*/}
        {this.state.popupline2 ? (
          <Mutation mutation={UPDATE_DATA}>
            {updateEmployee => (
              <PopupBase small={true} buttonStyles={{ justifyContent: "space-between" }}>
                <h2 className="boldHeading">
                  Edit Personal Data of {querydata.firstname} {querydata.lastname}
                </h2>
                <div>
                  <UniversalTextInput
                    id="hiredate"
                    label="Hiredate"
                    type="date"
                    livevalue={v => {
                      console.log("VALUE", v);
                      this.setState({ hiredate: v });
                    }}
                    startvalue={
                      querydata.hiredate ? moment(querydata.hiredate - 0).format("YYYY-MM-DD") : " "
                    }
                  />
                  {/* Hiredate:
                  <DatePicker
                    handleChange={v => {
                      console.log("VALUE", v);
                      this.setState({ hiredate: v });
                    }}
                    value={
                      querydata.hiredate ? moment(querydata.hiredate - 0).format("YYYY-MM-DD") : " "
                    }
                  />*/}
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="position"
                    label="Position"
                    livevalue={v => this.setState({ position: v })}
                    startvalue={querydata.position}
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="email"
                    label="Workmail"
                    livevalue={v => this.setState({ email: v })}
                    startvalue={
                      querydata.emails && querydata.emails[0] && querydata.emails[0].email
                    }
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="email"
                    label="Workmail 2"
                    livevalue={v => this.setState({ email2: v })}
                    startvalue={
                      querydata.emails && querydata.emails[1] && querydata.emails[1].email
                    }
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="workPhone"
                    label="Workphone"
                    livevalue={v => this.setState({ workPhone: v })}
                    startvalue={querydata.workPhones[0] && querydata.workPhones[0].number}
                  />
                  <div className="fieldsSeperator" />
                  <UniversalTextInput
                    id="workPhone2"
                    label="Workphone 2"
                    disabled={this.state.workPhone == ""}
                    livevalue={v => this.setState({ workPhone2: v })}
                    startvalue={querydata.workPhones[1] && querydata.workPhones[1].number}
                  />
                </div>
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.setState({ popupline2: false })}
                />
                <UniversalButton
                  label="Save"
                  type="high"
                  onClick={async () => {
                    try {
                      this.setState({ updateing: true });
                      await updateEmployee({
                        variables: {
                          user: {
                            id: querydata.id,
                            hiredate: this.state.hiredate ? this.state.hiredate : null,
                            position: this.state.position,
                            email: this.state.email,
                            email2: this.state.email2,
                            workPhone: Object.assign(
                              {},
                              querydata.workPhones &&
                                querydata.workPhones[0] &&
                                querydata.workPhones[0].id
                                ? { id: querydata.workPhones[0].id }
                                : {},
                              { number: this.state.workPhone || "" }
                            ),
                            workPhone2: Object.assign(
                              {},
                              querydata.workPhones &&
                                querydata.workPhones[1] &&
                                querydata.workPhones[1].id
                                ? { id: querydata.workPhones[1].id }
                                : {},
                              { number: this.state.workPhone2 || "" }
                            )
                          }
                        }
                      });
                      this.setState({ popupline2: false, updateing: false });
                    } catch (err) {
                      this.setState({ updateing: false, error: err });
                      console.log("err", err);
                    }
                  }}
                />
                {this.state.updateing ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <i className="fal fa-cog fa-spin" />
                    <span>Saving</span>
                  </PopupBase>
                ) : (
                  ""
                )}
                {this.state.error ? (
                  <PopupBase dialog={true} close={() => this.setState({ updateing: false })}>
                    <span>Something went wrong :( Please try again or contact support</span>
                    <UniversalButton
                      type="high"
                      label="Ok"
                      onClick={() => this.setState({ error: null })}
                    />
                  </PopupBase>
                ) : (
                  ""
                )}
              </PopupBase>
            )}
          </Mutation>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  }
}
export default compose(
  graphql(CREATE_EMAIL, { name: "createEmail" }),
  graphql(UPDATE_EMAIL, { name: "updateEmail" }),
  graphql(DELETE_EMAIL, { name: "deleteEmail" })
)(PersonalDetails);
