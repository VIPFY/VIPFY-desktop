import * as React from "react";
import PersonalData from "../components/profile/PersonalData";
import CompanyData from "../components/profile/CompanyData";
import AppList from "../components/profile/AppList";
import { Licence } from "../interfaces";

interface Props {
  setApp: Function;
  isadmin: boolean;
  id: number;
  showPopup: Function;
  licences: Licence;
}

export default (props: Props) => (
  <div id="profile-page">
    <PersonalData id={props.id} />
    {props.isadmin ? <CompanyData id={props.id} /> : ""}
    <AppList licences={props.licences.fetchLicences} setApp={props.setApp} />
  </div>
);
