import * as React from "react";
import EmployeeCard from "../../components/marketplace/EmployeeCard";
import PageHeader from "../../components/PageHeader";
import Tag from "../../common/Tag";
import { EmployeeTag, ServiceTag, TeamTag } from "../../common/Tag";
import welcomeImage from "../../../images/onboarding.png";

const DUMMY_APP = {
  name: "Dummy App",
  id: 123,
  icon: "Miro/logo.png",
  color: "grey",
  pic: welcomeImage,
  options: { marketplace: true },
  pros: [
    "This is the first pro we provide, and it is a very complicated explanation.",
    "This is the second pro",
    "This is the last pro we provide"
  ],
  features: [
    "Collaboration tools",
    "Gantt charts",
    "Cats",
    "Dogs",
    "Video chat",
    "File sharing",
    "Excel export",
    "Brain wipe",
    "And many, many, many more"
  ]
};

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
      <div>
        <PageHeader
          title="Checkout"
          showBreadCrumbs={true}
          buttonConfig={{ label: "Test Button", onClick: () => alert("works") }}
          wizardConfig={{
            currentStep: 0,
            steps: ["Select Employees", "Confirm Data"]
          }}
          searchConfig={{ text: "Search in Checkout" }}
          filterConfig={{}}
          pagination={{
            currentRowsFrom: 1,
            currentRowsTo: 12,
            currentRowsPerPage: 12,
            selectableRowsPerPage: [12, 24, 48],
            overallRows: 20
          }}
        />

        <div>
          <Tag className="marketplaceTag" large={true} style={{ margin: "10px" }}>
            Marketplace Tag
          </Tag>
          <Tag className="marketplaceTag" large={false} style={{ margin: "10px" }}>
            Marketplace Tag
          </Tag>
          <Tag
            className="marketplaceTag"
            large={false}
            className="disabled"
            style={{ margin: "10px" }}>
            Marketplace Tag
          </Tag>
        </div>

        <div>
          <Tag className="infoTag" large={true} style={{ margin: "10px" }}>
            Info Tag
          </Tag>
          <Tag className="infoTag" large={false} style={{ margin: "10px" }}>
            Info Tag
          </Tag>
          <Tag className="infoTag" large={false} className="disabled" style={{ margin: "10px" }}>
            Info Tag
          </Tag>
        </div>

        <div>
          <Tag className="pricingTag" large={true} style={{ margin: "10px" }}>
            Pricing Tag
          </Tag>
          <Tag className="pricingTag" large={false} style={{ margin: "10px" }}>
            Pricing Tag
          </Tag>
          <Tag className="pricingTag" large={false} className="disabled" style={{ margin: "10px" }}>
            Pricing Tag
          </Tag>
        </div>

        <div>
          <Tag large={true} faIcon="fa-user" style={{ margin: "10px" }}>
            Premium Account Maria
          </Tag>
          <Tag large={false} faIcon="fa-user" style={{ margin: "10px" }}>
            Premium Account Maria
          </Tag>
          <Tag large={false} faIcon="fa-user" className="disabled" style={{ margin: "10px" }}>
            Premium Account Maria
          </Tag>
        </div>

        <div>
          <EmployeeTag
            large={true}
            employee={{ firstname: "Eva", lastname: "Kiszka" }}
            style={{ margin: "10px" }}
          />
          <EmployeeTag
            large={false}
            employee={{ firstname: "Eva", lastname: "Kiszka" }}
            style={{ margin: "10px" }}
          />
          <EmployeeTag
            large={false}
            employee={{ firstname: "Eva", lastname: "Kiszka" }}
            className="disabled"
            style={{ margin: "10px" }}
          />
        </div>

        <div>
          <ServiceTag large={true} service={DUMMY_APP} style={{ margin: "10px" }} />
          <ServiceTag large={false} service={DUMMY_APP} style={{ margin: "10px" }} />
          <ServiceTag
            large={false}
            service={DUMMY_APP}
            className="disabled"
            style={{ margin: "10px" }}
          />
        </div>

        <div>
          <TeamTag large={true} team={{ name: "Backend" }} style={{ margin: "10px" }} />
          <TeamTag large={false} team={{ name: "Backend" }} style={{ margin: "10px" }} />
          <TeamTag
            large={false}
            team={{ name: "Backend" }}
            className="disabled"
            style={{ margin: "10px" }}
          />
        </div>
        <div>
          <EmployeeCard employee={DUMMY_USER} />
        </div>
      </div>
    );
  }
}

export default Checkout;
