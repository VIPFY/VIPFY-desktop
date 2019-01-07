import * as React from "react";
import AppList from "../components/profile/AppList";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp, filterError } from "../common/functions";

interface Props {
  firstname: string;
  history: any;
  lastname: string;
  rcApps: any;
  setApp: Function;
  moveTo: Function;
  showPopup: Function;
  licences: any;
  placeid?: string;
  disableWelcome: Function;
  addressProposal?: object;
  vatId: string;
  statisticData: object;
}

export default (props: Props) => {
  const setApp = (licence: number) => props.setApp(licence);

  if (props.licences.loading) {
    return <LoadingDiv text="Fetching Licences..." />;
  }

  if (props.licences.error) {
    return <ErrorComp error={filterError(props.licences.error)} />;
  }

  if (props.licences.length < 1) {
    return <div className="noApp">No Apps for you at the moment :(</div>;
  }

  return (
    <div className="dashboard-working">
      <div className="dashboardHeading">
        <div>My Apps</div>
      </div>
      <AppList showPopup={props.showPopup} setApp={setApp} />
    </div>
  );
};
