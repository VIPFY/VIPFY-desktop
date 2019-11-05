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
import moment from "moment";
import { REMOVE_EXTERNAL_ACCOUNT } from "../../../../mutations/products";

interface Props {
  service: any;
  team: any;
  savingFunction: Function;
  removeServiceFromTeam: Function;
  close: Function;
}

interface State {
  savingObject: any;
  keepLicences: any[];
}

const REMOVE_SERVICE_FROM_TEAM = gql`
  mutation removeServiceFromTeam($teamid: ID!, $boughtplanid: ID!, $keepLicences: [ID!]) {
    removeServiceFromTeam(teamid: $teamid, boughtplanid: $boughtplanid, keepLicences: $keepLicences)
  }
`;

class TeamLicenceDelete extends React.Component<Props, State> {
  state = {
    savingObject: null,
    keepLicences: []
  };

  printRemoveService() {
    let RLicencesArray: JSX.Element[] = [];
    this.props.team.employees.forEach((employee, int) => {
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={employee.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == employee.id),
                      1
                    );
                    return {
                      keepLicences: prevState.keepLicences
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(employee.id);
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
            }>
            <span>
              Delete licence of {employee.firstname} {employee.lastname}
            </span>
          </UniversalCheckbox>
        </li>
      );
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

  render() {
    const { service, close, team } = this.props;
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
                width: service.icon || service.planid.appid.icon ? "48px" : "46px",
                height: service.icon || service.planid.appid.icon ? "48px" : "46px",
                borderRadius: "4px",
                backgroundPosition: "center",
                backgroundSize: "cover",
                lineHeight: "46px",
                textAlign: "center",
                fontSize: "23px",
                color: "white",
                fontWeight: 500,
                backgroundColor: "white",
                border: "1px solid #253647",
                boxShadow: "#00000010 0px 6px 10px",
                backgroundImage:
                  (service.icon && service.icon.indexOf("/") != -1) ||
                  service.planid.appid.icon.indexOf("/") != -1
                    ? encodeURI(
                        `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${service.icon ||
                          service.planid.appid.icon})`
                      )
                    : encodeURI(
                        `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${service.icon ||
                          service.planid.appid.icon})`
                      )
              }}
            />
          </div>
          <div style={{ width: "284px" }}>
            <div style={{ marginBottom: "16px" }}>
              Do you really want to remove access to <b>{service.name}</b> for <b>{team.name}</b>
            </div>
            {this.printRemoveService()}
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
            this.setState({
              savingObject: {
                savingmessage: "The service is currently being removed from the team",
                savedmessage: "The service has been removed successfully.",
                maxtime: 5000,
                closeFunction: () =>
                  this.setState({
                    savingObject: null
                  }),
                saveFunction: async () =>
                  await this.props.removeServiceFromTeam({
                    variables: {
                      teamid: team.unitid.id,
                      boughtplanid: service.id,
                      keepLicences: this.state.keepLicences
                    }
                  })
              }
            });
          }}
        />
        {this.state.savingObject && (
          <PopupSelfSaving
            savedmessage={this.state.savingObject!.savedmessage}
            savingmessage={this.state.savingObject!.savingmessage}
            closeFunction={() => {
              this.props.savingFunction({ action: "deleted" });
              this.setState({ savingObject: null });
            }}
            saveFunction={async () => {
              await this.state.savingObject!.saveFunction();
            }}
            maxtime={5000}
          />
        )}
      </PopupBase>
    );
  }
}
export default compose(graphql(REMOVE_SERVICE_FROM_TEAM, { name: "removeServiceFromTeam" }))(
  TeamLicenceDelete
);
