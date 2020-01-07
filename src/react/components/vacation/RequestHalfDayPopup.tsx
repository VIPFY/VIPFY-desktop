import * as React from "react";
import moment from "moment";
import { Mutation } from "react-apollo";
import PopupBase from "../../popups/universalPopups/popupBase";
import UniversalButton from "../universalButtons/universalButton";
import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import { FETCH_VACATION_REQUESTS, REQUEST_HALF_DAY } from "./graphql";

export default ({ close, userid }: { close: Function; userid: number }) => {
  const [day, setDay] = React.useState(moment().format("YYYY-MM-DD"));

  return (
    <Mutation
      mutation={REQUEST_HALF_DAY}
      update={(cache, { data }) => {
        const cachedData = cache.readQuery({
          query: FETCH_VACATION_REQUESTS,
          variables: { userid }
        });

        // Brute force to enable rerender because the changes are too deeply nested.
        const fetchVacationRequests = JSON.parse(JSON.stringify(cachedData.fetchVacationRequests));
        const requests = fetchVacationRequests[0];

        requests.vacationRequests = [...requests.vacationRequests, data.requestHalfVacationDay];
        fetchVacationRequests[0] = requests;

        cache.writeQuery({
          query: FETCH_VACATION_REQUESTS,
          data: { fetchVacationRequests },
          variables: { userid }
        });

        close();
      }}>
      {(mutate, { loading, error }) => (
        <PopupBase small={true} close={close}>
          <h1>Request half a day</h1>
          <div>Please select the half day</div>
          <input
            onChange={e => setDay(e.target.value)}
            value={day}
            type="date"
            min={moment().format("YYYY-MM-DD")}
          />

          {loading && <LoadingDiv />}
          {<ErrorComp error={error} />}

          <UniversalButton label="cancel" disabled={loading} type="low" onClick={close} />
          <UniversalButton
            disabled={loading}
            onClick={() => mutate({ variables: { day } })}
            label="Confirm"
            type="high"
          />
        </PopupBase>
      )}
    </Mutation>
  );
};
