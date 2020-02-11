import * as React from "react";
import Collapsible from "../common/Collapsible";
import BoughtplanUsagePerUser from "../components/usage/BoughtplanUsagePerUser";
import UniversalSearchBox from "../components/universalSearchBox";

interface Props {
  company: any;
  showPopup: Function;
  history: History;
  moveTo: Function;
}

export default (props: Props) => {
  const [searchString, setSearch] = React.useState("");

  let teamname = "[failed to fetch name]";

  if (props.history.location.state && props.history.location.state.name) {
    teamname = props.history.location.state.name;
  }

  return (
    <div className="statistic-team managerPage">
      <div className="heading" style={{ gridColumnStart: 1, gridColumnEnd: 3 }}>
        <span className="h1">
          <span style={{ cursor: "pointer" }} onClick={() => props.moveTo("usage")}>
            Usage Statistics
          </span>
          <span className="h2">{teamname}</span>
        </span>
        <UniversalSearchBox
          getValue={value => setSearch(value)}
          placeholder="Search Usage Statistics"
        />
      </div>

      <Collapsible title={`Time spent in ${teamname}`}>
        <div className="inside">
          <BoughtplanUsagePerUser
            {...props}
            search={searchString}
            boughtplanid={props.match.params.boughtplanid}
          />
        </div>
      </Collapsible>
    </div>
  );
};
