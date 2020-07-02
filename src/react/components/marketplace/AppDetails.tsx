import * as React from "react";

const DUMMY_APP = {
  name: "Dummy App with an extreeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeemely Long Name",
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
    console.log(DUMMY_APP);

    return <div className="marketplace"></div>;
  }
}

export default AppDetails;
