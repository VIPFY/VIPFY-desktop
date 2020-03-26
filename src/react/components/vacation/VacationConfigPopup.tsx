import * as React from "react";
import gql from "graphql-tag";
import moment from "moment";
import { Mutation } from "react-apollo";
import UserName from "../UserName";
import { FETCH_VACATION_REQUESTS } from "./graphql";
import { ErrorComp } from "../../common/functions";
import UniversalButton from "../universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalTextInput from "../universalForms/universalTextInput";

const SET_VACATION_DAYS = gql`
  mutation onSetVacationDays($year: Int!, $days: Int!, $userid: ID!) {
    setVacationDays(year: $year, days: $days, userid: $userid)
  }
`;
interface Props {
  close: Function;
  id: string;
}

export default (props: Props) => {
  const [days, setDays] = React.useState(0);
  const [year, setYear] = React.useState(moment().get("year"));

  return (
    <Mutation
      mutation={SET_VACATION_DAYS}
      update={proxy => {
        const cachedData = proxy.readQuery({ query: FETCH_VACATION_REQUESTS });

        const fetchVacationRequests = cachedData.fetchVacationRequests.map(emp => {
          if (props.id == emp.id) {
            emp.vacationDaysPerYear = { ...emp.vacationDaysPerYear, [year]: days };
          }

          return emp;
        });

        proxy.writeQuery({ query: FETCH_VACATION_REQUESTS, data: { fetchVacationRequests } });

        setYear(moment().get("year"));
        setDays(0);
      }}
      onCompleted={() => {
        props.close();
        setYear(moment().get("year"));
        setDays(0);
      }}>
      {(mutate, { loading, error }) => (
        <PopupBase
          buttonStyles={{ justifyContent: "space-between" }}
          close={() => {
            props.close();
            setYear(moment().get("year"));
            setDays(0);
          }}
          small={true}>
          <h1>
            Set <UserName unitid={props.id} />
            's vacation days
          </h1>
          <div>
            How many vacation days should <UserName unitid={props.id} /> have?
          </div>

          <form
            id="setup-vacation-form"
            onSubmit={() => mutate({ variables: { userid: props.id, year, days } })}>
            <UniversalTextInput
              id="days"
              min={0}
              type="number"
              label="Days"
              livevalue={v => setDays(parseInt(v))}
            />

            <UniversalTextInput
              id="days"
              startvalue={year.toString()}
              type="number"
              label="Year"
              livevalue={v => setYear(parseInt(v))}
            />
          </form>
          <ErrorComp error={error} />

          <UniversalButton
            label="cancel"
            disabled={loading}
            type="low"
            onClick={() => {
              props.close();
              setYear(moment().get("year"));
              setDays(0);
            }}
          />
          <UniversalButton
            form="setup-vacation-form"
            disabled={loading}
            label="Confirm"
            type="high"
          />
        </PopupBase>
      )}
    </Mutation>
  );
};
