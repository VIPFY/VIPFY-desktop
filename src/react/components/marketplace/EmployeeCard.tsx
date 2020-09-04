import * as React from "react";
import { ServiceLogo } from "vipfy-ui-lib";
import { concatName } from "../../common/functions";
import UniversalCheckbox from "../../components/universalForms/universalCheckbox";
import CardSection from "../CardSection";
import EmployeePicture from "../EmployeePicture";
import Tag from "../../common/Tag";

interface EmployeeCardProps {
  employee: any;
  hideDetails?: boolean;
  hideTeams?: boolean;
  hideServices?: boolean;
}

class EmployeeCard extends React.Component<EmployeeCardProps> {
  render() {
    const { employee, hideDetails, hideServices, hideTeams } = this.props;

    return (
      <div className="card employeeCard">
        <CardSection className="header">
          <EmployeePicture
            className="pic"
            size={40}
            employee={employee}
            circle={true}
            style={{ marginTop: "0", fontSize: "14px" }}
          />

          <div className="title">{concatName(employee)}</div>

          <div>
            <UniversalCheckbox liveValue={() => {}}></UniversalCheckbox>
          </div>
        </CardSection>

        {!hideDetails && (
          <CardSection className="details">
            {employee.position && (
              <>
                <span className="fal fa-fw fa-user" />
                <span>{employee.position}</span>
              </>
            )}

            {employee.emails && employee.emails[0] && (
              <>
                <span className="fal fa-fw fa-envelope" />
                <span>{employee.emails[0]}</span>
              </>
            )}

            {employee.phones && employee.phones[0] && (
              <>
                <span className="fal fa-fw fa-phone" />
                <span>{employee.phones[0]}</span>
              </>
            )}

            {employee.addresses &&
              employee.addresses[0] &&
              employee.addresses[0].address &&
              employee.addresses[0].address.city && (
                <>
                  <span className="fal fa-fw fa-location-arrow" />
                  <span>{employee.addresses[0].address.city}</span>
                </>
              )}
          </CardSection>
        )}

        {!hideTeams && (
          <CardSection className="tagsRow">
            {employee.teams.map((team, i) => (
              <Tag key={i}>{team}</Tag>
            ))}
          </CardSection>
        )}

        {!hideServices && (
          <CardSection className="serviceLogosRow">
            {employee.assignments.map((service, i) => (
              <ServiceLogo icon={service.icon} size={24} key={i} />
            ))}
          </CardSection>
        )}
      </div>
    );
  }
}

export default EmployeeCard;
