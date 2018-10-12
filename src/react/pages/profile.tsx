import * as React from "react";
import PersonalData from "../components/profile/PersonalData";
import CompanyData from "../components/profile/CompanyData";
import AppList from "../components/profile/AppList";

export default (props: { setApp: Function; showPopup: Function }) => (
  <div id="profile-page">
    <PersonalData />
    <CompanyData />
    <AppList setApp={props.setApp} showPopup={props.showPopup} />
  </div>
);
