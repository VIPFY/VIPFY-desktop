import * as React from "react";
import { PageHeader } from "@vipfy-private/vipfy-ui-lib";

import EmployeeCard from "../../components/marketplace/EmployeeCard";
import { AppContext } from "../../common/functions";

const DUMMY_USER = {
  id: "582a705d-d650-4727-8db6-28d231b465dd",
  firstname: "Magdalena-Anna",
  middlename: "Swetlana",
  lastname: "von Schmiggel-Pullewupp-Hohenzollern",
  title: "Prof. Dr. rer. nat.",
  profilepicture: "",
  emails: ["magdalena.klauss@vipfy.store"],
  addresses: [{ address: { city: "Saarbrücken" } }],
  phones: ["+49 176 21 31 41 51"],
  position: "Developer",
  teams: ["Backend", "Frontend", "Management", "Marketing"],
  assignments: [
    {
      id: 1234,
      name: "Miro",
      icon: "Miro/logo.png",
      color: "lemonchiffon"
    },
    {
      id: 1235,
      name: "Dribbble",
      icon: "Dribbble/logo.png",
      color: "pink"
    },
    {
      id: 1236,
      name: "Sendgrid",
      icon: "Sendgrid/logo.png",
      color: "lightblue"
    }
  ]
};

class Checkout extends React.Component<{}> {
  render() {
    return (
      <div className="page">
        <div className="pageContent">
          {/* <PageHeader
            history={this.props.history}
            appContext={AppContext}
            title="Checkout"
            buttonConfig={{ label: "Test Button", onClick: () => alert("works") }}
          /> */}

          <div>
            <EmployeeCard employee={DUMMY_USER} />
          </div>
        </div>
      </div>
    );
  }
}

export default Checkout;
