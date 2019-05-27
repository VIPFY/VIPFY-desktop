import * as React from "react";
import moment = require("moment");
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";
import UniversalButton from "../universalButtons/universalButton";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import UniversalDropDownInput from "../universalForms/universalDropdownInput";

const UPDATE_DATA = gql`
  mutation updateEmployee($user: EmployeeInput!) {
    updateEmployee(user: $user) {
      id
      firstname
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
  servicedata: any;
}

interface State {
  editpopup: Boolean;
  name: string;
  type: string;
  error: string | null;
}

class ServiceGeneralData extends React.Component<Props, State> {
  state = {
    editpopup: false,
    name: this.props.servicedata.app.name || "",
    type: (this.props.servicedata.app.features && this.props.servicedata.app.features.type) || "",
    supportwebsite: this.props.servicedata.app.supportwebsite || "",
    error: null
  };

  calculateTotalLicences() {
    let counter = 0;
    if (this.props.servicedata.teams.length > 0) {
      this.props.servicedata.teams.forEach(team => {
        counter += team.employees.length;
      });
    }
    counter += this.props.servicedata.licences.length;
    return counter;
  }

  render() {
    console.log(this.props.servicedata);
    const service = this.props.servicedata;
    return (
      <>
        <div className="tableRow" style={{ height: "80px" }}>
          <div className="tableMain">
            <div className="tableColumnSmall">
              <h1>Name</h1>
              <h2>{this.state.name}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Industry</h1>
              <h2>{this.state.type}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Supportwebsite</h1>
              <h2>{this.state.supportwebsite}</h2>
            </div>
            <div className="tableColumnSmall">
              <h1>Licences in total</h1>
              <h2>{this.props.servicedata.licences.length}</h2>
            </div>
          </div>
          <div className="tableEnd">
            <div className="editOptions">
              {/*<i className="fal fa-edit" onClick={() => this.setState({ editpopup: true })} />*/}
            </div>
          </div>
        </div>
        {/*this.state.popupline1 ? (
          <Mutation mutation={UPDATE_DATA}>
            {updateEmployee => (
              <PopupBase small={true} buttonStyles={{ justifyContent: "space-between" }}>
                <h2 className="boldHeading">
                  Edit Personal Data of {this.props.firstname} {querydata.lastname}
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
                  <div className="fieldsSeperator" />
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
                  />
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
                    const nameparts = this.state.name.split(" ");
                    const middlenameArray = nameparts.length > 1 ? nameparts.slice(1, -1) : null;
                    try {
                      this.setState({ updateing: true });
                      await updateEmployee({
                        variables: {
                          user: {
                            id: querydata.id,
                            firstname: nameparts[0],
                            lastname: nameparts[nameparts.length - 1],
                            middlename: "",
                            birthday: this.state.birthday ? this.state.birthday : null,
                            address: Object.assign(
                              {},
                              querydata.addresses[0] && querydata.addresses[0].id
                                ? { id: querydata.addresses[0].id }
                                : {},
                              { street: this.state.street },
                              { zip: this.state.zip },
                              { city: this.state.city },
                              { country: this.state.country }
                            ),
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
      </>
    );
  }
}
export default ServiceGeneralData;
