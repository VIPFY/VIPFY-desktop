import * as React from "react";
import { App } from "electron";
import CardSection from "../CardSection";
import EmployeePicture from "../EmployeePicture";

interface EmployeeCardProps {
  employee?: { apps: App[] };
}

const DUMMY_USER = {
  id: "582a705d-d650-4727-8db6-28d231b465dd",
  firstname: "Magdalena",
  middlename: "Swetlana",
  lastname: "von der Klauss",
  title: "Prof. Dr. rer. nat.",
  profilepicture: "",
  // profilepicture: "profilepictures/26022020-b4wav-blob",
  emails: ["magdalena.klauss@vipfy.store"],
  addresses: [{ address: { city: "Saarbrücken" } }],
  phones: ["+49 176 21 31 41 51"],
  position: "Developer",
  assignments: [
    "168f1353-1807-4795-ae85-93f2d52e9f2d",
    "1a13b2a7-3ed2-426f-9f94-b8e9f2c943ea",
    "1aedd7ef-96df-400e-bf40-81a2369abe9e",
    "6ce6d54e-4d68-4973-87a4-90eaa4e04c86",
    "aa1fc808-1198-4209-b861-30cbb7ac3609",
    "f2d670f6-dafb-4d4a-8496-7e2226d56e99"
  ]
};

class EmployeeCard extends React.Component<EmployeeCardProps> {
  render() {
    return (
      <div className="card">
        <CardSection>
          <div className="pic">
            <EmployeePicture
              size={40}
              employee={DUMMY_USER}
              style={{ marginTop: "0", borderRadius: "20px", fontSize: "14px" }}
            />
          </div>
          <div></div>
        </CardSection>
        <CardSection>
          <div />
        </CardSection>
        <CardSection>
          <div />
        </CardSection>
      </div>
    );
  }
}

export default EmployeeCard;
