import * as React from "react";
import moment = require("moment");
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import { Mutation, compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { parseName } from "humanparser";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import { sleep, concatName } from "../../common/functions";

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
  createPhone: Function;
  deletePhone: Function;
  updatePhone: Function;
  refetch: Function;
}

interface State {
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
  editvalueArray: Object[];
}

const CREATE_EMAIL = gql`
  mutation onCreateEmail($emailData: EmailInput!, $company: Boolean, $userid: ID) {
    createEmail(emailData: $emailData, forCompany: $company, userid: $userid) {
      email
      description
      priority
      verified
      tags
    }
  }
`;

const UPDATE_EMAIL = gql`
  mutation onUpdateEmail($email: String!, $emailData: EmailUpdateInput!, $userid: ID) {
    updateEmail08(email: $email, emailData: $emailData, userid: $userid) {
      email
      description
    }
  }
`;

const DELETE_EMAIL = gql`
  mutation onDeleteEmail($email: String!, $company: Boolean, $userid: ID) {
    deleteEmail(email: $email, forCompany: $company, userid: $userid) {
      ok
    }
  }
`;

const CREATE_PHONE = gql`
  mutation onCreatePhone($phoneData: PhoneInput!, $department: Boolean, $userid: ID) {
    createPhone(phoneData: $phoneData, department: $department, userid: $userid) {
      id
      number
      description
      priority
      verified
      tags
    }
  }
`;

const UPDATE_PHONE = gql`
  mutation onUpdatePhone($phone: PhoneInput!, $id: ID!, $userid: ID) {
    updatePhone(phone: $phone, id: $id, userid: $userid) {
      id
      number
      description
      priority
      verified
      tags
    }
  }
`;

const DELETE_PHONE = gql`
  mutation onDeletePhone($id: ID!, $department: Boolean, $userid: ID) {
    deletePhone(id: $id, department: $department, userid: $userid) {
      ok
    }
  }
`;

class PersonalDetails extends React.Component<Props, State> {
  state = {
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

  printEditForm() {
    switch (this.state.edit.id) {
      case "emails":
        const emailforms: JSX.Element[] = [];
        let newemail = false;
        if (Math.max(this.props.querydata.emails.length, this.state.editvalueArray.length) > 0) {
          const emails = this.props.querydata.emails.map((email, index) => {
            if (this.state.editvalueArray[index]) {
              return this.state.editvalueArray[index];
            } else {
              return { ...email, disabled: true };
            }
          });
          this.state.editvalueArray.forEach(
            (email, index) => index >= this.props.querydata.emails.length && emails.push(email)
          );
          let first = true;
          emails.forEach((email, index) => {
            if (!first && !email.emaildeleted) {
              emailforms.push(<div key={`sep-${index}`} className="fieldsSeperator" />);
            }
            if (!email.emaildeleted) {
              first = false;
            }
            newemail =
              newemail || (!email.emaildeleted && (email.email == null || email.email == ""));
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
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = { emaildeleted: true, oldemail: email.email };
                    return { editvalueArray };
                  });
                }}
                style={email.emaildeleted && { display: "none" }}
                disabled={email.disabled}
              />
            );
          });
        }
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
        return emailforms;

      case "workphones":
        const phoneforms: JSX.Element[] = [];
        let newphone = false;
        if (
          Math.max(this.props.querydata.workPhones.length, this.state.editvalueArray.length) > 0
        ) {
          const phones = this.props.querydata.workPhones.map((phone, index) => {
            if (this.state.editvalueArray[index]) {
              const update = this.state.editvalueArray[index];
              return { ...phone, ...update };
            } else {
              return { ...phone };
            }
          });
          this.state.editvalueArray.forEach(
            (phone, index) => index >= this.props.querydata.workPhones.length && phones.push(phone)
          );
          let first = true;
          phones.forEach((phone, index) => {
            if (!first && !phone.phonedeleted) {
              phoneforms.push(<div key={`sep-${index}`} className="fieldsSeperator" />);
            }
            if (!phone.phonedeleted) {
              first = false;
            }
            newphone =
              newphone || (!phone.phonedeleted && (phone.number == null || phone.number == ""));
            phoneforms.push(
              <UniversalTextInput
                id={`${this.state.edit.id}-${phone.id}`}
                label={this.state.edit.label}
                livevalue={v =>
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = {
                      ...phone,
                      number: v
                    };
                    return { editvalueArray };
                  })
                }
                startvalue={phone.number}
                deleteFunction={() => {
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = { ...phone, phonedeleted: true };
                    return { editvalueArray };
                  });
                }}
                style={phone.phonedeleted && { display: "none" }}
                disabled={phone.disabled}
              />
            );
          });
        }
        if (!newphone) {
          phoneforms.push(
            <UniversalButton
              type="low"
              label="Add Workphone"
              onClick={() =>
                this.setState(({ editvalueArray }) => {
                  editvalueArray[
                    Math.max(editvalueArray.length, this.props.querydata.workPhones.length)
                  ] = {
                    number: null,
                    newphone: true,
                    tags: ["work"],
                    id: `new-${Math.max(
                      editvalueArray.length,
                      this.props.querydata.privatePhones.length
                    )}`
                  };
                  return { editvalueArray };
                })
              }
            />
          );
        }
        return phoneforms;

      case "privatephones":
        const privatephoneforms: JSX.Element[] = [];
        let privatenewphone = false;
        if (
          Math.max(this.props.querydata.privatePhones.length, this.state.editvalueArray.length) > 0
        ) {
          const phones = this.props.querydata.privatePhones.map((phone, index) => {
            if (this.state.editvalueArray[index]) {
              const update = this.state.editvalueArray[index];
              return { ...phone, ...update };
            } else {
              return { ...phone };
            }
          });
          this.state.editvalueArray.forEach(
            (phone, index) =>
              index >= this.props.querydata.privatePhones.length && phones.push(phone)
          );
          let first = true;
          phones.forEach((phone, index) => {
            if (!first && !phone.phonedeleted) {
              privatephoneforms.push(<div key={`sep-${index}`} className="fieldsSeperator" />);
            }
            if (!phone.phonedeleted) {
              first = false;
            }
            privatenewphone =
              privatenewphone ||
              (!phone.phonedeleted && (phone.number == null || phone.number == ""));
            privatephoneforms.push(
              <UniversalTextInput
                id={`${this.state.edit.id}-${phone.id}`}
                label={this.state.edit.label}
                livevalue={v =>
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = {
                      ...phone,
                      number: v
                    };
                    return { editvalueArray };
                  })
                }
                startvalue={phone.number}
                deleteFunction={() => {
                  this.setState(({ editvalueArray }) => {
                    editvalueArray[index] = { ...phone, phonedeleted: true };
                    return { editvalueArray };
                  });
                }}
                style={phone.phonedeleted && { display: "none" }}
                disabled={phone.disabled}
              />
            );
          });
        }
        if (!privatenewphone) {
          privatephoneforms.push(
            <UniversalButton
              type="low"
              label="Add Privatephone"
              onClick={() =>
                this.setState(({ editvalueArray }) => {
                  editvalueArray[
                    Math.max(editvalueArray.length, this.props.querydata.privatePhones.length)
                  ] = {
                    number: null,
                    newphone: true,
                    tags: ["private"],
                    id: `new-${Math.max(
                      editvalueArray.length,
                      this.props.querydata.privatePhones.length
                    )}`
                  };
                  return { editvalueArray };
                })
              }
            />
          );
        }
        return privatephoneforms;

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
        <div className="tableRowShow" style={{ height: "80px", width: "100%" }}>
          <div className="tableMain" style={{ width: "100%" }}>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "name",
                    label: "Name",
                    startvalue: concatName(querydata),
                    checking: true
                  }
                })
              }>
              <h1>Name</h1>
              <h2>{concatName(querydata)}</h2>
              <div className="profileEditButton">
                <i className="fal fa-pen editbuttons" />
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
                <i className="fal fa-pen editbuttons" />
              </div>
            </div>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "privatephones",
                    label: "Privatephone",
                    startvalue: querydata.privatePhones
                  }
                })
              }>
              <h1>
                Private Phone{" "}
                <span className="morehint">
                  {querydata.privatePhones.length > 2 &&
                    `+${querydata.privatePhones.length - 2} more`}
                </span>
              </h1>
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
                <i className="fal fa-pen editbuttons" />
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
          </div>
        </div>
        <div className="tableRowShow" style={{ height: "80px", width: "100%" }}>
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
                <i className="fal fa-pen editbuttons" />
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
                <i className="fal fa-pen editbuttons" />
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
              <h1>
                Workmail{" "}
                <span className="morehint">
                  {querydata.emails.length > 2 && `+${querydata.emails.length - 2} more`}
                </span>
              </h1>
              <h2>{querydata.emails && querydata.emails[0] && querydata.emails[0].email}</h2>
              <h2 className="second">
                {querydata.emails && querydata.emails[1] && querydata.emails[1].email}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pen editbuttons" />
              </div>
            </div>
            <div
              className="tableColumnSmall editable"
              onClick={() =>
                this.setState({
                  edit: {
                    id: "workphones",
                    label: "Workphone",
                    startvalue: querydata.workPhones
                  }
                })
              }>
              <h1>
                Work Phone{" "}
                <span className="morehint">
                  {querydata.workPhones.length > 2 && `+${querydata.workPhones.length - 2} more`}
                </span>
              </h1>
              <h2>
                {querydata.workPhones && querydata.workPhones[0] && querydata.workPhones[0].number}
              </h2>
              <h2 className="second">
                {querydata.workPhones && querydata.workPhones[1] && querydata.workPhones[1].number}
              </h2>
              <div className="profileEditButton">
                <i className="fal fa-pen editbuttons" />
              </div>
            </div>
          </div>
        </div>
        {this.state.edit && (
          <Mutation mutation={UPDATE_DATA}>
            {updateEmployee => (
              <PopupBase
                small={true}
                buttonStyles={{ justifyContent: "space-between" }}
                additionalclassName="formPopup">
                <h1>Edit Personal Data</h1>
                <h2>
                  Edit {this.state.edit!.label} of {concatName(querydata)}
                </h2>
                <div>{this.printEditForm()}</div>
                <UniversalButton
                  label="Cancel"
                  type="low"
                  onClick={() => this.setState({ edit: null, editvalue: null, editvalueArray: [] })}
                />
                {console.log("STATE DETAILS", this.state)}
                <UniversalButton
                  label="Save"
                  type="high"
                  disabled={
                    this.state.edit!.checking &&
                    (!(this.state.editvalue != null && this.state.editvalue != "") ||
                      (this.state.editvalueArray != null &&
                        this.state.editvalueArray.some(v => v != null && v != "")))
                  }
                  onClick={async () => {
                    this.setState({ updateing: true });
                    return;
                  }}
                />
                {this.state.updateing ? (
                  <PopupSelfSaving
                    heading={`Save ${this.state.edit.label} of ${concatName(querydata)}`}
                    saveFunction={async () => {
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
                          const promisesEmails: any[] = [];
                          this.state.editvalueArray.forEach(edit => {
                            if (edit) {
                              if (
                                edit.newemail &&
                                !edit.emaildeleted &&
                                edit.email &&
                                edit.email.includes("@")
                              ) {
                                //new valid email
                                promisesEmails.push(
                                  this.props.createEmail({
                                    variables: {
                                      userid: querydata.id,
                                      emailData: {
                                        email: edit.email
                                      }
                                    }
                                  })
                                );
                              } else if (edit.emaildeleted) {
                                promisesEmails.push(
                                  this.props.deleteEmail({
                                    variables: {
                                      userid: querydata.id,
                                      email: edit.oldemail
                                    }
                                  })
                                );
                              } /*else {
                              promisesEmails.push(
                                this.props.updateEmail({
                                  variables: {
                                    userid: querydata.id,
                                    emailData: {
                                      email: edit.email
                                    },
                                    email: edit.oldemail
                                  }
                                })
                              );
                            }*/
                            }
                          });
                          await Promise.all(promisesEmails);
                          this.props.refetch();
                          this.setState({ editvalueArray: [] });
                          break;

                        case "workphones":
                          const promisesPhones: any[] = [];
                          this.state.editvalueArray.forEach(edit => {
                            if (edit) {
                              if (edit.newphone && !edit.phonedeleted && edit.number) {
                                //new valid email
                                promisesPhones.push(
                                  this.props.createPhone({
                                    variables: {
                                      userid: querydata.id,
                                      phoneData: {
                                        number: edit.number,
                                        tags: edit.tags
                                      }
                                    }
                                  })
                                );
                              } else if (edit.phonedeleted && !edit.newphone) {
                                promisesPhones.push(
                                  this.props.deletePhone({
                                    variables: {
                                      userid: querydata.id,
                                      id: edit.id
                                    }
                                  })
                                );
                              } else if (!(edit.phonedeleted && edit.newphone) && edit.number) {
                                promisesPhones.push(
                                  this.props.updatePhone({
                                    variables: {
                                      userid: querydata.id,
                                      id: edit.id,
                                      phone: {
                                        number: edit.number,
                                        tags: edit.tags
                                      }
                                    }
                                  })
                                );
                              }
                            }
                          });
                          await Promise.all(promisesPhones);
                          this.props.refetch();
                          this.setState({ editvalueArray: [] });
                          break;

                        case "privatephones":
                          const promisespPhones: any[] = [];
                          this.state.editvalueArray.forEach(edit => {
                            if (edit) {
                              if (edit.newphone && !edit.phonedeleted && edit.number) {
                                //new valid email
                                promisespPhones.push(
                                  this.props.createPhone({
                                    variables: {
                                      userid: querydata.id,
                                      phoneData: {
                                        number: edit.number,
                                        tags: edit.tags
                                      }
                                    }
                                  })
                                );
                              } else if (edit.phonedeleted && !edit.newphone) {
                                promisespPhones.push(
                                  this.props.deletePhone({
                                    variables: {
                                      userid: querydata.id,
                                      id: edit.id
                                    }
                                  })
                                );
                              } else if (!(edit.phonedeleted && edit.newphone) && edit.number) {
                                promisespPhones.push(
                                  this.props.updatePhone({
                                    variables: {
                                      userid: querydata.id,
                                      id: edit.id,
                                      phone: {
                                        number: edit.number,
                                        tags: edit.tags
                                      }
                                    }
                                  })
                                );
                              }
                            }
                          });
                          await Promise.all(promisespPhones);
                          this.props.refetch();
                          this.setState({ editvalueArray: [] });
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
                    }}
                    closeFunction={() =>
                      this.setState({ edit: null, updateing: false, editvalue: null })
                    }
                    savingmessage="Saving"
                    savedmessage={`${this.state.edit.label} saved`}
                  />
                ) : (
                  /*<PopupBase small={true} close={() => this.setState({ updateing: false })}>
                    <i className="fal fa-spinner fa-spin" />
                    <span>Saving</span>
                  </PopupBase>*/
                  ""
                )}
                {this.state.error ? (
                  <PopupBase small={true} close={() => this.setState({ updateing: false })}>
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
      </React.Fragment>
    );
  }
}
export default compose(
  graphql(CREATE_EMAIL, { name: "createEmail" }),
  graphql(UPDATE_EMAIL, { name: "updateEmail" }),
  graphql(DELETE_EMAIL, { name: "deleteEmail" }),
  graphql(CREATE_PHONE, { name: "createPhone" }),
  graphql(UPDATE_PHONE, { name: "updatePhone" }),
  graphql(DELETE_PHONE, { name: "deletePhone" })
)(PersonalDetails);
