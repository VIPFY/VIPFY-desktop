import * as React from "react";
import PopupBase from "./universalPopups/popupBase";
import UniversalTextInput from "../components/universalForms/universalTextInput";
import UniversalButton from "../components/universalButtons/universalButton";
import { compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { FETCH_ADDRESSES } from "../queries/contact";
import UniversalDropDownInput from "../components/universalForms/universalDropdownInput";
import { countries } from "../constants/countries";

interface Props {
  close: Function;
  createPhone: Function;
  oldvalues?: {
    number: string;
    description: string;
    id: number;
  };
  updatePhone: Function;
  delete?: Boolean;
  deletePhone: Function;
}

interface State {
  number: string;
  description: string;
  confirm: Boolean;
  networking: Boolean;
  networkerror: Boolean;
}

const CREATE_PHONE = gql`
  mutation onCreatePhone($phoneData: PhoneInput!, $department: Boolean) {
    createPhone(phoneData: $phoneData, department: $department) {
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
  mutation onUpdatePhone($phone: PhoneInput!, $id: ID!) {
    updatePhone(phone: $phone, id: $id) {
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
  mutation onDeletePhone($id: ID!, $department: Boolean) {
    deletePhone(id: $id, department: $department) {
      ok
    }
  }
`;

const FETCH_PHONES = gql`
  query onFetchPhones($company: Boolean) {
    fetchPhones(forCompany: $company) {
      id
      number
      description
      priority
      verified
      tags
    }
  }
`;

class PopupPhone extends React.Component<Props, State> {
  state = {
    number: this.props.oldvalues ? this.props.oldvalues.number : "",
    description: this.props.oldvalues ? this.props.oldvalues.description : "",
    confirm: false,
    networking: true,
    networkerror: false
  };

  delete = async () => {
    this.setState({ confirm: true, networking: true });
    try {
      this.props.deletePhone({
        variables: { id: this.props.oldvalues!.id, department: true },
        update: proxy => {
          // Read the data from our cache for this query.
          const cachedData = proxy.readQuery({ query: FETCH_PHONES, variables: { company: true } });
          const filteredPhones = cachedData.fetchPhones.filter(
            phone => phone.id != this.props.oldvalues!.id
          );
          // Write our data back to the cache.
          proxy.writeQuery({
            query: FETCH_PHONES,
            variables: { company: true },
            data: { fetchPhones: filteredPhones }
          });
        }
      });
      this.setState({ networking: false, networkerror: false });
    } catch (err) {
      this.setState({ networking: false, networkerror: true });
      throw err;
    }
  };

  confirm = async () => {
    this.setState({ confirm: true, networking: true });
    if (this.props.oldvalues) {
      try {
        const res = await this.props.updatePhone({
          variables: {
            phone: {
              number: this.state.number,
              description: this.state.description,
              department: true
            },
            id: this.props.oldvalues.id
          }
        });
        console.log("RES", res);
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true });
        throw err;
      }
    } else {
      try {
        await this.props.createPhone({
          variables: {
            phoneData: { number: this.state.number, description: this.state.description },
            department: true
          },
          update: (proxy, { data: { createPhone } }) => {
            // Read the data from our cache for this query.
            const cachedData = proxy.readQuery({
              query: FETCH_PHONES,
              variables: { company: true }
            });
            cachedData.fetchPhones.push(createPhone);
            // Write our data back to the cache.
            proxy.writeQuery({
              query: FETCH_PHONES,
              variables: { company: true },
              data: cachedData
            });
          }
        });
        this.setState({ networking: false, networkerror: false });
      } catch (err) {
        this.setState({ networking: false, networkerror: true });
        throw err;
      }
    }
  };

  render() {
    if (this.props.delete) {
      return (
        <PopupBase close={() => this.props.close()} small={true} closeable={false}>
          <h2 className="lightHeading">Do you really want to delete this phonenumber?</h2>
          <div>
            <p>
              <span className="bold light">Number: </span>
              <span className="light">{this.props.oldvalues!.number}</span>
            </p>
            <p>
              <span className="bold light">Description: </span>
              <span className="light">{this.props.oldvalues!.description}</span>
            </p>
          </div>
          <UniversalButton type="low" closingPopup={true} label="Cancel" />
          <UniversalButton
            type="low"
            label="Delete"
            onClick={() => {
              this.delete();
            }}
          />
          {this.state.confirm ? (
            <PopupBase
              close={() => this.setState({ confirm: false, networking: true })}
              small={true}
              closeable={false}
              autoclosing={10}
              autoclosingFunction={() => this.setState({ networking: false, networkerror: true })}
              notimer={true}>
              {this.state.networking ? (
                <div>
                  <div style={{ fontSize: "32px", textAlign: "center" }}>
                    <i className="fal fa-spinner fa-spin" />
                    <div style={{ marginTop: "32px", fontSize: "16px" }}>
                      We currently deleting your phonenumber in our system.
                    </div>
                  </div>
                </div>
              ) : this.state.networkerror ? (
                <React.Fragment>
                  <div>
                    Something went wrong
                    <br />
                    Please try again or contact support
                  </div>
                  <UniversalButton
                    type="high"
                    closingPopup={true}
                    label="Ok"
                    closingAllPopups={true}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div>Your phonenumber has been successfully deleted</div>
                  <UniversalButton
                    type="high"
                    closingPopup={true}
                    label="Ok"
                    closingAllPopups={true}
                  />
                </React.Fragment>
              )}
            </PopupBase>
          ) : (
            ""
          )}
        </PopupBase>
      );
    }
    return (
      <PopupBase close={() => this.props.close()}>
        <h2 className="lightHeading">
          {this.props.oldvalues
            ? "Please change your phonenumber"
            : "Please insert your phonenumber"}
        </h2>
        <UniversalTextInput
          id="number"
          label="Number"
          livevalue={value => this.setState({ number: value })}
          width="500px"
          startvalue={this.props.oldvalues ? this.props.oldvalues.number : ""}
        />
        <UniversalTextInput
          id="description"
          label="Description"
          livevalue={value => this.setState({ description: value })}
          width="500px"
          startvalue={this.props.oldvalues ? this.props.oldvalues.description : ""}
        />
        <UniversalButton type="low" closingPopup={true} label="Cancel" />
        <UniversalButton
          type="high"
          label={this.props.oldvalues ? "Save" : "Confirm"}
          disabled={this.state.number == ""}
          onClick={async () => {
            this.confirm();
          }}
        />
        {this.state.confirm ? (
          <PopupBase
            close={() => this.setState({ confirm: false, networking: true })}
            small={true}
            closeable={false}
            autoclosing={10}
            autoclosingFunction={() => this.setState({ networking: false, networkerror: true })}
            notimer={true}>
            {this.state.networking ? (
              <div>
                <div style={{ fontSize: "32px", textAlign: "center" }}>
                  <i className="fal fa-spinner fa-spin" />
                  <div style={{ marginTop: "32px", fontSize: "16px" }}>
                    {this.props.oldvalues
                      ? "We currently update your phonenumber in our system."
                      : "We currently create your phonenumber in our system."}
                  </div>
                </div>
              </div>
            ) : this.state.networkerror ? (
              <React.Fragment>
                <div>
                  Something went wrong
                  <br />
                  Please try again or contact support
                </div>
                <UniversalButton
                  type="high"
                  closingPopup={true}
                  label="Ok"
                  closingAllPopups={true}
                />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div>
                  {this.props.oldvalues
                    ? "Your phonenumber has been successfully updated"
                    : "Your phonenumber has been successfully created"}
                </div>
                <UniversalButton
                  type="high"
                  closingPopup={true}
                  label="Ok"
                  closingAllPopups={true}
                />
              </React.Fragment>
            )}
          </PopupBase>
        ) : (
          ""
        )}
      </PopupBase>
    );
  }
}
export default compose(
  graphql(CREATE_PHONE, { name: "createPhone" }),
  graphql(UPDATE_PHONE, { name: "updatePhone" }),
  graphql(DELETE_PHONE, { name: "deletePhone" })
)(PopupPhone);
