import * as React from "react";
import * as moment from "moment";
import Collapsible from "../../common/Collapsible";
import DatePicker from "../../common/DatePicker";
import UniversalButton from "../universalButtons/universalButton";
import IconButton from "../../common/IconButton";
import { ErrorComp, computeFullDays } from "../../common/functions";
import { FETCH_VACATION_REQUESTS } from "./graphql";
import { Query } from "react-apollo";
import LoadingDiv from "../LoadingDiv";
import RequestVacationPopup from "./RequestVacationPopup";
import RequestHalfDayPopup from "./RequestHalfDayPopup";

interface Props {
  id: number;
  isAdmin: boolean;
}

interface Field {
  startDate: moment.Moment | string;
  endDate: moment.Moment | string;
  fieldError?: string;
}

export default (props: Props) => {
  const defaultValue = [{ startDate: moment(), endDate: moment() }] as Field[];
  const [requests, setRequests] = React.useState(defaultValue);
  const [showPopup, setShow] = React.useState(false);
  const [showHalfDay, setShowHalfDay] = React.useState(false);
  const currentYear = moment().get("year");

  const setDate = (val, pos, prop) => {
    setRequests(currentRequests => {
      const updatedRequests = [...currentRequests];
      updatedRequests[pos][prop] = val;
      updatedRequests[pos].fieldError = "";

      return updatedRequests;
    });
  };

  const computeRemainingDays = (fullDays, vacationRequests) => {
    vacationRequests
      .filter(({ requested }) => moment(requested).get("year") == currentYear)
      .forEach(({ days, status }) => {
        if (status != "CANCELLED" && status != "REJECTED") {
          fullDays -= days;
        }
      });

    return fullDays;
  };

  const handleSubmit = e => {
    e.preventDefault();

    requests.forEach(({ startDate, endDate }, key) => {
      if (moment(endDate).isBefore(startDate)) {
        setRequests(currentRequests => {
          const updatedRequests = [...currentRequests];
          updatedRequests[key].fieldError = "The end date must be before the start date!";

          return updatedRequests;
        });
      }
    });

    const hasError = requests.find(({ fieldError }) => fieldError);

    if (hasError) {
      return;
    } else {
      setShow(true);
    }
  };

  return (
    <Collapsible title="Request Vacation">
      <Query query={FETCH_VACATION_REQUESTS} variables={{ userid: props.id }}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data) {
            return <ErrorComp error={error} />;
          }

          const { vacationDaysPerYear, vacationRequests } = data.fetchVacationRequests[0];

          if (!vacationDaysPerYear) {
            return (
              <section className="no-data">
                This feature has not been set up for you yet. Please ask your administrator to do
                so.
              </section>
            );
          }

          if (!vacationDaysPerYear[currentYear]) {
            return (
              <section className="no-data">
                Your admin has not entered your vacation days into the system yet. Please ask him to
                do so.
              </section>
            );
          }

          return (
            <section className="vacation-request">
              <h1>Please select the period you want to have your vacation for</h1>

              <div className="vacation-days">{`You can make requests for ${computeRemainingDays(
                computeFullDays(data.fetchVacationRequests[0]),
                vacationRequests
              )} more days.`}</div>

              <UniversalButton
                className="vacation-days"
                label="Request half a day"
                type="high"
                onClick={() => setShowHalfDay(true)}
              />

              <form id="vacation-request-form" onSubmit={handleSubmit}>
                {requests.map(({ startDate, endDate, fieldError }, key) => (
                  <div key={key} className="vacation-form-row">
                    <span>From</span>
                    <DatePicker
                      minDate={moment().format("YYYY-MM-DD")}
                      maxDate={moment(`${moment().year()}-12-31`)}
                      style={{ position: "absolute", top: "-150px" }}
                      value={startDate}
                      handleChange={v => setDate(v, key, "startDate")}
                      useHolidays={true}
                    />
                    <span>Till</span>
                    <DatePicker
                      maxDate={moment(`${moment().year()}-12-31`)}
                      style={{ position: "absolute", top: "-150px" }}
                      value={endDate}
                      handleChange={v => setDate(v, key, "endDate")}
                      useHolidays={true}
                    />

                    <IconButton
                      type="button"
                      icon="plus"
                      onClick={() => {
                        setRequests(currentRequests => {
                          const newRequests = [
                            ...currentRequests,
                            { startDate: moment(), endDate: moment() }
                          ];

                          return newRequests;
                        });
                      }}
                    />

                    {requests.length > 1 && key !== 0 && (
                      <IconButton
                        type="button"
                        icon="minus"
                        onClick={() => {
                          setRequests(currentRequests => {
                            const filteredRequests = [
                              ...currentRequests.slice(0, key),
                              ...currentRequests.slice(key + 1, currentRequests.length)
                            ];

                            return filteredRequests;
                          });
                        }}
                      />
                    )}

                    <ErrorComp error={fieldError} />
                  </div>
                ))}
              </form>

              <div className="vacation-form-buttons">
                <UniversalButton
                  onClick={() => setRequests(defaultValue)}
                  type="low"
                  label="cancel"
                />
                <UniversalButton form="vacation-request-form" type="high" label="submit" />
              </div>
            </section>
          );
        }}
      </Query>

      {showPopup && (
        <RequestVacationPopup userid={props.id} requests={requests} close={() => setShow(false)} />
      )}

      {showHalfDay && <RequestHalfDayPopup userid={props.id} close={() => setShowHalfDay(false)} />}
    </Collapsible>
  );
};
