import * as React from "react";

const DUMMY_APP = {
  name: "Dummy App",
  id: 123,
  icon: "Miro/logo.png",
  color: "grey",
  // pic: welcomeImage,
  options: { marketplace: true },
  pros: [
    "This is the first pro we provide",
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

interface AppDetailsProps {}

class AppDetails extends React.Component<AppDetailsProps> {
  render() {
    return (
      <div className="marketplace">
        <div className="marketplaceContainer appDetails">
          <div className="headline">
            <h4 className="breadCrumbs">
              Categories / Communication / <span>{DUMMY_APP.name}</span>
            </h4>
            <h1>{DUMMY_APP.name}</h1>
          </div>
        </div>
      </div>
    );
  }
}

export default AppDetails;
