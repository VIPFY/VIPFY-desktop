import * as React from "react";
import PersonalData from "../components/profile/PersonalData";
import CompanyData from "../components/profile/CompanyData";
import AppList from "../components/profile/AppList";

export default (props: { setApp: Function; id: number }) => (
  <div id="profile-page">
    <PersonalData id={props.id} />
    <CompanyData id={props.id} />
    <AppList setApp={props.setApp} />
  </div>
);
