import * as React from "react";
import PopupBase from "../../../../popups/universalPopups/popupBase";
import UniversalButton from "../../../universalButtons/universalButton";
import UniversalCheckbox from "../../../../components/universalForms/universalCheckbox";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import PopupSelfSaving from "../../../../popups/universalPopups/selfSaving";
import { fetchLicences } from "../../../../queries/auth";
import { me } from "../../../../queries/auth";
import { fetchUserLicences } from "../../../../queries/departments";
import moment = require("moment");
import { REMOVE_EXTERNAL_ACCOUNT } from "../../../../mutations/products";

interface Props {
  employee: any;
  licence: any;
  removeLicence: Function;
  savingFunction: Function;
  deleteLicenceAt: Function;
  close: Function;
}

interface State {
  savingObject: any;
  keepAccount: Boolean;
}

const REMOVE_LICENCE = gql`
  mutation removeLicence($licenceid: ID!, $oldname: String!) {
    removeLicence(licenceid: $licenceid, oldname: $oldname)
  }
`;

class LicenceDelete extends React.Component<Props, State> {
  state = {
    savingObject: null,
    keepAccount: true
  };

  render() {
    const { employee, licence, close } = this.props;
    return (
      <PopupBase
        small={true}
        close={() => close()}
        closeable={false}
        buttonStyles={{ marginTop: "0px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "relative", width: "88px", height: "112px" }}>
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "48px",
                height: "48px",
                borderRadius: "4px",
                border: "1px dashed #707070"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "16px",
                width: "70px",
                height: "70px",
                fontSize: "32px",
                lineHeight: "70px",
                textAlign: "center",
                borderRadius: "4px",
                backgroundColor: "#F5F5F5",
                border: "1px solid #253647"
              }}>
              <i className="fal fa-trash-alt" />
            </div>
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8px",
                width: this.props.employee.profilepicture ? "48px" : "46px",
                height: this.props.employee.profilepicture ? "48px" : "46px",
                borderRadius: "4px",
                backgroundPosition: "center",
                backgroundSize: "cover",
                lineHeight: "46px",
                textAlign: "center",
                fontSize: "23px",
                color: "white",
                fontWeight: 500,
                backgroundColor: "#5D76FF",
                border: "1px solid #253647",
                boxShadow: "#00000010 0px 6px 10px",
                backgroundImage: this.props.employee.profilepicture
                  ? this.props.employee.profilepicture.indexOf("/") != -1
                    ? encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/userimages.vipfy.store/${
                          this.props.employee.profilepicture
                        })`
                      )
                    : encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/${
                          this.props.employee.profilepicture
                        })`
                      )
                  : ""
              }}>
              {this.props.employee.profilepicture ? "" : this.props.employee.firstname.slice(0, 1)}
            </div>
          </div>
          <div style={{ width: "284px" }}>
            <div style={{ marginBottom: "16px" }}>
              Do you really want to remove access to <b>{licence.boughtplanid.planid.appid.name}</b>{" "}
              for{" "}
              <b>
                {this.props.employee.firstname} {this.props.employee.lastname}
              </b>
            </div>
            <UniversalCheckbox
              startingvalue={true}
              liveValue={v => this.setState({ keepAccount: v })}>
              Keep Account in system
            </UniversalCheckbox>
          </div>
        </div>
        {/*<p>
          Do you really want to delete the licence for{" "}
          <b>{e.boughtplanid.planid.appid.name}</b>
        </p>*/}
        <UniversalButton type="low" closingPopup={true} label="Cancel" />
        <UniversalButton
          type="low"
          label="Delete"
          onClick={() => {
            if (!this.state.keepAccount) {
              this.setState({
                savingObject: {
                  savingmessage: "Ok, we remove the access and remove the account from our system",
                  savedmessage: `The account is successfully removed. Please delete the account in your ${
                    licence.boughtplanid.planid.appid.name
                  }-subscription!`,
                  maxtime: 5000,
                  closeFunction: () => {
                    this.props.savingFunction({ action: "deleted", licenceid: licence.id });
                    this.setState({ savingObject: null });
                  },
                  saveFunction: () => {
                    try {
                      this.props.deleteLicenceAt({
                        variables: {
                          licenceid: licence.id,
                          time: moment().utc()
                        },
                        refetchQueries: [
                          { query: fetchLicences },
                          { query: me },
                          {
                            query: fetchUserLicences,
                            variables: { unitid: employee.id }
                          }
                        ]
                      });
                      this.props.savingFunction({ action: "deleted", licenceid: licence.id });
                    } catch (error) {
                      this.props.savingFunction({ action: "error", licenceid: licence.id });
                      this.setState({ savingObject: null });
                    }
                  }
                }
              });
            } else {
              this.setState({
                savingObject: {
                  savingmessage: "Removing the access",
                  savedmessage: "The access is successfully removed.",
                  maxtime: 5000,
                  closeFunction: () => {
                    this.props.savingFunction({ action: "deleted", licenceid: licence.id });
                    this.setState({ savingObject: null });
                  },
                  saveFunction: () => {
                    try {
                      this.props.removeLicence({
                        variables: {
                          licenceid: licence.id,
                          oldname: `${employee.firstname} ${employee.lastname}`
                        },
                        refetchQueries: [
                          { query: fetchLicences },
                          { query: me },
                          {
                            query: fetchUserLicences,
                            variables: { unitid: employee.id }
                          }
                        ]
                      });
                      this.props.savingFunction({ action: "deleted", licenceid: licence.id });
                    } catch (error) {
                      this.props.savingFunction({ action: "error", licenceid: licence.id });
                      this.setState({ savingObject: null });
                    }
                  }
                }
              });
            }
          }}
        />
        {this.state.savingObject && (
          <PopupSelfSaving
            savedmessage={this.state.savingObject!.savedmessage}
            savingmessage={this.state.savingObject!.savingmessage}
            closeFunction={() => {
              this.setState({ savingObject: null });
            }}
            saveFunction={async () => await this.state.savingObject!.saveFunction()}
            maxtime={5000}
          />
        )}
      </PopupBase>
    );
  }
}
export default compose(
  graphql(REMOVE_LICENCE, { name: "removeLicence" }),
  graphql(REMOVE_EXTERNAL_ACCOUNT, { name: "deleteLicenceAt" })
)(LicenceDelete);
