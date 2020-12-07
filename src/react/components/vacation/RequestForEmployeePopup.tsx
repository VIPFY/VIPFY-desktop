import * as React from "react";
import moment, { Moment } from "moment";
import { Mutation } from "@apollo/client/react/components";
import UserName from "../UserName";
import { ErrorComp } from "../../common/functions";
import UniversalButton from "../universalButtons/universalButton";
import PopupBase from "../../popups/universalPopups/popupBase";
import { REQUEST_VACATION_FOR_EMPLOYEE, REQUEST_HALF_DAY_FOR_EMPLOYEE } from "./graphql";

interface Props {
  close: Function;
  id: string;
}

interface Variables {
  userid: string;
  day?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
}

export default (props: Props) => {
  const [startDate, setStartDate] = React.useState<null | string>();
  const [endDate, setEndDate] = React.useState<string>(moment().format("YYYY-MM-DD"));
  const [halfDay, setHalfDay] = React.useState<boolean>(false);

  return (
    <Mutation
      mutation={halfDay ? REQUEST_HALF_DAY_FOR_EMPLOYEE : REQUEST_VACATION_FOR_EMPLOYEE}
      onCompleted={() => props.close()}>
      {(mutate, { loading, error = null }) => (
        <PopupBase
          buttonStyles={{ justifyContent: "space-between" }}
          close={props.close}
          small={true}>
          <h1>
            Enter a vacation for <UserName unitid={props.id} />
          </h1>

          <form
            onSubmit={e => {
              e.preventDefault();

              let variables: Variables = { userid: props.id };

              if (halfDay) {
                variables.day = startDate;
              } else {
                const duration = moment
                  .duration(moment(endDate).diff(moment(startDate)))
                  .get("days");
                let days = 0;

                for (let i = 0; i <= duration; i++) {
                  const today = moment(startDate).add(i, "days");
                  if (today.get("day") !== 0 && today.get("day") !== 6) {
                    days++;
                  }
                }

                variables = { ...variables, startDate, endDate, days };
              }

              mutate({ variables });
            }}
            id="request-vacation-form">
            {halfDay ? (
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            ) : (
              <React.Fragment>
                <span>From</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span>To</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </React.Fragment>
            )}
          </form>

          <div className="vacation-toggle" onClick={() => setHalfDay(prev => (prev = !prev))}>
            {halfDay ? "or enter a duration" : "or enter half a day"}
          </div>

          <ErrorComp error={error} />

          <UniversalButton label="cancel" disabled={loading} type="low" onClick={props.close} />
          <UniversalButton
            form="request-vacation-form"
            disabled={loading}
            label="Confirm"
            type="high"
          />
        </PopupBase>
      )}
    </Mutation>
  );
};
