import * as React from "react";
import { Mutation } from "react-apollo";
import "moment-feiertage";
import gql from "graphql-tag";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import moment from "moment";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";

const REQUEST_VACATION = gql`
  mutation onRequestVacation($startDate: Date!, $endDate: Date!, $days: Int!) {
    requestVacation(startDate: $startDate, endDate: $endDate, days: $days)
  }
`;

interface Props {
  requests: any[];
  close: Function;
}

export default (props: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const computeDuration = (startDate, endDate) => {
    if (startDate.format("LL") == endDate.format("LL")) {
      return 1;
    }

    // Otherwise it won't be a full day
    const properEndDate = moment(endDate).add(1, "day");
    return moment.duration(properEndDate.endOf("day").diff(startDate.startOf("day"))).days();
  };

  const computeVacationDays = (date, days) => {
    const clonedDate = moment(date);

    if (days == 1) {
      return 1;
    }

    let offDays = 0;

    for (let i = 0; i < days; i++) {
      clonedDate.add(i < 2 ? i : 1, "days");

      if (
        clonedDate.isoWeekday() == 6 ||
        clonedDate.isoWeekday() == 7 ||
        clonedDate.isHoliday(["SL"]).holidayName
      ) {
        offDays++;
      }
    }

    return days - offDays;
  };

  const handleSubmit = async requestVacation => {
    try {
      setLoading(true);
      setError(null);

      const promises = props.requests.map(({ startDate, endDate }) => {
        const days = computeVacationDays(
          startDate,
          computeDuration(moment(startDate), moment(endDate))
        );

        return requestVacation({ variables: { startDate, endDate, days } });
      });

      await Promise.all(promises);
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <Mutation mutation={REQUEST_VACATION}>
      {mutate => (
        <PopupBase
          small={true}
          styles={{ textAlign: "center" }}
          buttonStyles={{ justifyContent: "space-around" }}
          close={props.close}>
          <h1>Confirm Vacation Request</h1>
          <div>Please confirm the correctness of the dates</div>

          <ul className="vacation-requests-overview">
            {props.requests.map((request, key) => {
              const startDate = moment(request.startDate);
              const endDate = moment(request.endDate);
              const duration = computeDuration(startDate, endDate);

              return (
                <li key={key}>
                  <span>
                    {startDate.format("LL") == endDate.format("LL")
                      ? startDate.format("LL")
                      : `${startDate.format("LL")} - ${endDate.format("LL")}`}
                  </span>
                  <i style={{ margin: "0 20px" }} className="fal fa-minus" />
                  <span>{`${computeVacationDays(startDate, duration)} day${
                    duration == 1 ? "" : "s"
                  }`}</span>
                </li>
              );
            })}
          </ul>

          {loading && <LoadingDiv style={{ height: "200px" }} />}
          {error && <ErrorComp error={error} />}
          {success && <div className="success">Vacation successfully requested</div>}

          <UniversalButton
            disabled={loading || success}
            type="low"
            label="Cancel"
            onClick={props.close}
          />
          <UniversalButton
            disabled={loading || success}
            type="high"
            label="confirm"
            onClick={() => handleSubmit(mutate)}
          />
        </PopupBase>
      )}
    </Mutation>
  );
};
