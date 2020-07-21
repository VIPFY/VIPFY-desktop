import * as React from "react";
import EmployeeCard from "../../components/marketplace/EmployeeCard";
import PageHeader from "../../components/PageHeader";

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

const BUTTON_CONFIG = { label: "Press me!", onClick: () => alert("works") };

class Checkout extends React.Component<{}> {
  render() {
    return (
      <div>
        <PageHeader title="Checkout" buttonConfig={BUTTON_CONFIG} />
        <div>
          <EmployeeCard employee={DUMMY_USER} />
        </div>
      </div>
    );
  }
}

export default Checkout;
