import * as React from "react";
import RequestVacation from "../components/vacation/RequestVacation";
import VacationRequests from "../components/vacation/VacationRequests";
import UserVacationRequests from "../components/vacation/UserVacationRequests";

interface Props {
  id: string;
  isadmin: boolean;
  firstname: string;
  lastname: string;
}

export default (props: Props) => {
  return (
    <section id="vacation">
      <div className="heading">
        <h1>Vacation</h1>
      </div>

      <VacationRequests id={props.id} isAdmin={props.isadmin} />
      <UserVacationRequests id={props.id} />
      <RequestVacation id={props.id} isAdmin={props.isadmin} />
    </section>
  );
};
