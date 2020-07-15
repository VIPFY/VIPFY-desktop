import * as React from "react";
import UniversalButton from "../../components/universalButtons/universalButton";
import TeamServiceDetails from "./teamserviceDetails";
import AssignNewTeamOrbit from "./universal/adding/assignNewTeamOrbit";
import { now } from "moment";

interface Props {
  team: any;
  search: string;
  moveTo: Function;
}

interface State {
  add: Boolean;
}

class ServiceSection extends React.Component<Props, State> {
  state = {
    add: false
  };

  render() {
    let services: any[] = [];
    let interservices: any[] = [];
    if (this.props.team.services) {
      interservices = this.props.team.services.filter(e => e.endtime == null || e.endtime < now());

      interservices.sort(function (a, b) {
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
        <TeamServiceDetails service={service} team={this.props.team} moveTo={this.props.moveTo} />
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
            <div className="tableEnd"></div>
          </div>
          {serviceArray}
        </div>
        {this.state.add && (
          <AssignNewTeamOrbit
            team={this.props.team}
            close={() => this.setState({ add: false })}
            moveTo={this.props.moveTo}
          />
        )}
      </div>
    );
  }
}
export default ServiceSection;
