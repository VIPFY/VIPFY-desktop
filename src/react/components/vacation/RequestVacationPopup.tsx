import * as React from "react";
import { Mutation } from "@apollo/client/react/components";
import * as moment from "moment-feiertage";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { FETCH_VACATION_REQUESTS, REQUEST_VACATION } from "./graphql";

interface Props {
  userid: string;
  requests: any[];
  close: Function;
}

export default (props: Props) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<null | any>(null);
  const [success, setSuccess] = React.useState<boolean>(false);

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

      if (clonedDate.isoWeekday() >= 6) {
        offDays++;
      } else {
        if (clonedDate.format("DD.MM") == "24.12" || clonedDate.format("DD.MM") == "31.12") {
          offDays += 0.5;
        } else if (clonedDate.isHoliday("SL")) {
          offDays++;
        }
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
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <Mutation
      mutation={REQUEST_VACATION}
      update={(cache, { data }) => {
        const cachedData = cache.readQuery({
          query: FETCH_VACATION_REQUESTS,
          variables: { userid: props.userid }
        });

        // Brute force to enable rerender because the changes are too deeply nested.
        const fetchVacationRequests = JSON.parse(JSON.stringify(cachedData.fetchVacationRequests));
        const requests = fetchVacationRequests[0];

        requests.vacationRequests = [...requests.vacationRequests, data.requestVacation];
        fetchVacationRequests[0] = requests;
        cache.writeQuery({
          query: FETCH_VACATION_REQUESTS,
          data: { fetchVacationRequests },
          variables: { userid: props.userid }
        });

        setLoading(false);
        setSuccess(true);
        setTimeout(() => props.close(), 500);
      }}>
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

          {loading && <LoadingDiv />}
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
