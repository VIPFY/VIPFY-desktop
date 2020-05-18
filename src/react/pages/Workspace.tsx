import * as React from "react";
import gql from "graphql-tag";
import moment from "moment";
import { Query, Mutation } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp } from "../common/functions";
import { WorkAround, User } from "../interfaces";
import PrintEmployeeSquare from "../components/manager/universal/squares/printEmployeeSquare";
import UniversalButton from "../components/universalButtons/universalButton";

const FETCH_VIPFY_OFFICE = gql`
  {
    fetchVIPFYOffice {
      id
      employees {
        id
        firstname
        middlename
        lastname
        profilepicture
      }
      officePlans: officeplans
    }
  }
`;

const RESERVE_SEATS = gql`
  mutation onReserveSeats($seats: Seats!) {
    reserveSeats(seats: $seats)
  }
`;

interface Props {
  myID: string;
  currentWeek: {
    monday: { [any: number]: string };
    tuesday: { [any: number]: string };
    wednesday: { [any: number]: string };
    thursday: { [any: number]: string };
    friday: { [any: number]: string };
  };
  employees: User[];
}

// ISO-8601, Europe
moment.updateLocale("en", {
  week: {
    dow: 1, // First day of week is Monday
    doy: 4 // First week of year must contain 4 January (7 + 1 - 4)
  }
});
const nextWeekMonday = moment().add(1, "week").startOf("week");

const Workspace = (props: Props) => {
  const [day, setDay] = React.useState(0);
  const [seats, updateSeats] = React.useState(props.currentWeek);

  const renderTakenSeat = userID => (
    <React.Fragment key={userID}>
      <input type="radio" id={userID} name="seat" disabled />
      <label htmlFor={userID}>
        <PrintEmployeeSquare employee={props.employees.find(({ id }) => id == userID)} />
      </label>
    </React.Fragment>
  );

  const getWeekDay = key => moment().weekday(key).format("dddd").toLowerCase();

  const renderOpenSeat = id => {
    const seatTaken = seats[getWeekDay(day)][id];

    if (seatTaken) {
      return renderTakenSeat(seatTaken);
    } else {
      return (
        <React.Fragment key={`user-seat-${id}`}>
          <input id={`user-seat-${id}`} type="radio" name="seat" value={id} />
          <label style={{ visibility: "hidden" }} />
        </React.Fragment>
      );
    }
  };

  function handleChange(e): void {
    e.preventDefault();
    const value = e.target.value;

    updateSeats(oldState => {
      Object.keys(oldState[getWeekDay(day)]).forEach(d => {
        if (oldState[getWeekDay(day)][d] == props.myID) {
          oldState[getWeekDay(day)][d] = null;
        }
      });

      return {
        ...oldState,
        [getWeekDay(day)]: { ...oldState[getWeekDay(day)], [value]: props.myID }
      };
    });
  }

  return (
    <section className="covid">
      <h1>Please select a seat</h1>
      <div className="date-selector">
        <span>{`From ${nextWeekMonday.format("LL")} to ${moment()
          .add(1, "week")
          .endOf("week")
          .subtract(2, "days")
          .format("LL")}`}</span>
        <ul>
          {[...new Array(5)].map((_i, key) => (
            <li
              key={key}
              className={key == day ? "active-day" : ""}
              role="button"
              onClick={() => setDay(key)}>
              {moment().weekday(key).format("dddd")}
            </li>
          ))}
        </ul>
      </div>

      <Mutation<WorkAround, WorkAround>
        mutation={RESERVE_SEATS}
        onCompleted={data => updateSeats(data.reserveSeats)}>
        {(mutate, { data, loading, error }) => (
          <React.Fragment>
            <form
              onSubmit={e => {
                e.preventDefault();

                const reserve = Object.keys(seats).reduce((acc, cV) => {
                  const data = Object.keys(seats[cV]).find(index => seats[cV][index] == props.myID);
                  acc[cV] = data || null;

                  return acc;
                }, {});

                mutate({ variables: { seats: reserve } });
              }}
              id="offices"
              onChange={handleChange}>
              <div id="office-1">
                <div className="table">
                  {renderTakenSeat("e72a945f-b29d-445b-ab68-d75d1070bdb6")}
                  {renderOpenSeat(1)}
                </div>

                <div className="table">{renderOpenSeat(2)}</div>

                <div className="table">
                  {renderOpenSeat(3)}
                  {renderTakenSeat("98cdb502-51fc-4c0d-a5c7-ee274b6bb7b5")}
                  {renderOpenSeat(4)}
                </div>

                <div className="table">
                  {[
                    "f876804e-efd0-48b4-a5b2-807cbf66315f",
                    "96d65748-7d36-459a-97d0-7f52a7a4bbf0",
                    "91bd25cb-65cc-4dca-b0c8-285dbf5919f3"
                  ].map(userID => renderTakenSeat(userID))}
                </div>
              </div>

              <div id="office-2">
                <div className="table">
                  {renderOpenSeat(5)}
                  {renderOpenSeat(6)}
                  {renderTakenSeat("b65a0528-59b1-4137-887f-faf3d6a07fd7")}
                </div>
              </div>

              <ErrorComp error={error} />
              {data && (
                <div className="success">
                  Your reservation was successful <i className="fal fa-thumbs-up" />
                </div>
              )}

              <div id="office-3">
                <div className="table">
                  {renderOpenSeat(7)}
                  <input disabled />
                  <label style={{ visibility: "hidden" }} />
                  {renderOpenSeat(8)}
                </div>
              </div>
            </form>

            <UniversalButton
              disabled={loading}
              onClick={() => updateSeats(props.currentWeek)}
              type="low"
              label="reset"
            />
            <UniversalButton disabled={loading} form="offices" type="high" label="submit" />
          </React.Fragment>
        )}
      </Mutation>
    </section>
  );
};

export default (props: { id: string }) => (
  <Query<WorkAround, WorkAround> fetchPolicy="network-only" query={FETCH_VIPFY_OFFICE}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv />;
      }

      if (error || !data) {
        return <ErrorComp error={error} />;
      }

      return (
        <Workspace
          myID={props.id}
          currentWeek={data.fetchVIPFYOffice.officePlans}
          employees={data.fetchVIPFYOffice.employees}
        />
      );
    }}
  </Query>
);
