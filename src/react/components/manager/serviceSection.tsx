import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import gql from "graphql-tag";
import UniversalCheckbox from "../universalForms/universalCheckbox";
import PopupSelfSaving from "../../popups/universalPopups/selfSaving";
import AddTeamService from "./addTeamService";
import TeamServiceDetails from "./teamserviceDetails";
import ManageTeamServices from "./universal/managing/teamservices";
import AssignNewTeamOrbit from "./universal/adding/assignNewTeamOrbit";

interface Props {
  team: any;
  search: string;
  moveTo: Function;
}

interface State {
  delete: Boolean;
  confirm: Boolean;
  network: Boolean;
  deleted: Boolean;
  add: Boolean;
  keepLicences: number[];
  deleteerror: string | null;
  savingObject: {
    savedmessage: string;
    savingmessage: string;
    closeFunction: Function;
    saveFunction: Function;
  } | null;
}

const REMOVE_EMPLOYEE_FROM_TEAM = gql`
  mutation removeFromTeam($teamid: ID!, $userid: ID!, $keepLicences: [ID!]) {
    removeFromTeam(teamid: $teamid, userid: $userid, keepLicences: $keepLicences)
  }
`;

class ServiceSection extends React.Component<Props, State> {
  state = {
    delete: false,
    confirm: false,
    network: false,
    deleted: false,
    add: false,
    keepLicences: [],
    deleteerror: null,
    savingObject: null
  };

  printRemoveLicences(team) {
    let RLicencesArray: JSX.Element[] = [];

    team.services.forEach((service, int) => {
      RLicencesArray.push(
        <li key={int}>
          <UniversalCheckbox
            name={service.id}
            startingvalue={true}
            liveValue={v =>
              v
                ? this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences.splice(
                      prevState.keepLicences.findIndex(l => l == service.id),
                      1
                    );
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
                : this.setState(prevState => {
                    const keepLicencesNew = prevState.keepLicences;
                    keepLicencesNew.push(service.id);
                    return {
                      keepLicences: keepLicencesNew
                    };
                  })
            }>
            <span>Delete licence of {service.planid.appid.name}</span>
          </UniversalCheckbox>
        </li>
      );
    });
    return RLicencesArray != [] ? <ul style={{ marginTop: "20px" }}>{RLicencesArray}</ul> : "";
  }

  render() {
    let services: any[] = [];
    let interservices: any[] = [];
    if (this.props.team.services) {
      interservices = this.props.team.services;

      interservices.sort(function(a, b) {
        let nameA = a.planid.appid.name.toUpperCase();
        let nameB = b.planid.appid.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // namen müssen gleich sein
        return 0;
      });
      if (this.props.search && this.props.search != "") {
        services = interservices.filter(a => {
          return a.planid.appid.name.toUpperCase().includes(this.props.search.toUpperCase());
        });
      } else {
        services = interservices;
      }
    }

    const serviceArray: JSX.Element[] = [];

    services.forEach((service, k) => {
      serviceArray.push(
        <TeamServiceDetails
          service={service}
          team={this.props.team}
          deleteFunction={sO => this.setState({ savingObject: sO })}
          moveTo={this.props.moveTo}
        />
      );
    });

    return (
      <div className="section">
        <div className="heading">
          <h1>Orbits</h1>
          <UniversalButton
            type="high"
            label="Assign Orbit"
            customStyles={{
              fontSize: "12px",
              lineHeight: "24px",
              fontWeight: "700",
              marginRight: "16px",
              width: "120px"
            }}
            onClick={() => {
              this.setState({ add: true });
            }}
          />
        </div>
        <div className="table">
          <div className="tableHeading">
            <div className="tableMain">
              <div className="tableColumnSmall">
                <h1>Service</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Orbitname</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>Status</h1>
              </div>
              <div className="tableColumnSmall">
                <h1>{/*Price*/}</h1>
              </div>
              <div className="tableColumnSmall">{/*<h1>Average Usage</h1>*/}</div>
            </div>
            <div className="tableEnd">
              {/*<UniversalButton
                type="high"
                label="Manage Services"
                customStyles={{
                  fontSize: "12px",
                  lineHeight: "24px",
                  fontWeight: "700",
                  marginRight: "16px",
                  width: "120px"
                }}
                onClick={() => {
                  this.setState({ add: true });
                }}
              />*/}
            </div>
          </div>
          {serviceArray}
        </div>
        {/*this.state.add && (
          <ManageTeamServices
            close={sO => {
              this.setState({ add: false, savingObject: sO });
            }}
            team={this.props.team}>
            <div className="buttonsPopup">
              <UniversalButton
                label="Close"
                type="low"
                onClick={() => this.setState({ add: false })}
              />
            </div>
          </ManageTeamServices>
          )*/}
        {this.state.add && (
          <AssignNewTeamOrbit team={this.props.team} close={() => this.setState({ add: false })} />
        )}
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
      </div>
    );
  }
}
export default ServiceSection;
