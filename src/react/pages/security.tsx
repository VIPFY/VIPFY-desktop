import * as React from "react";
import UserSecurityTable from "../components/security/UserSecurityTable";
import UniversalSearchBox from "../components/universalSearchBox";
import Collapsible from "../common/Collapsible";

interface Props {
  showPopup: Function;
  history: any;
  client: any;
}

export const SecurityContext = React.createContext();

export default (props: Props) => {
  const [search, setSearch] = React.useState("");

  return (
    <SecurityContext.Provider value={{ history: props.history, client: props.client }}>
      {
        <div className="managerPage">
          <div className="heading">
            <h1>Security</h1>
            <UniversalSearchBox getValue={v => setSearch(v)} />
          </div>

          <Collapsible title="Overview">
            <UserSecurityTable search={search} />
          </Collapsible>
        </div>
      }
    </SecurityContext.Provider>
  );
};
