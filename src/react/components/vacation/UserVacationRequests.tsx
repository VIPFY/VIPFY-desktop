import * as React from "react";
import { Query } from "react-apollo";
import Collapsible from "../../common/Collapsible";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { FETCH_VACATION_REQUESTS } from "../../components/vacation/graphql";
import moment from "moment";
import UniversalButton from "../universalButtons/universalButton";
import IconButton from "../../common/IconButton";
import PopupBase from "../../popups/universalPopups/popupBase";

interface Props {
  id: number;
}

export default (props: Props) => {
  const [show, setShow] = React.useState(false);
  const renderIcon = status => {
    switch (status) {
      case "PENDING":
        return "clock";

      case "REJECTED":
        return "times";

      case "CONFIRMED":
        return "check";

      default:
        return "secret";
    }
  };

  return (
    <Collapsible title="Vacation Requests">
      <div className="table-holder">
        <table>
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Vacation Days</th>
              <th>Status</th>
              <th rowSpan={2} />
            </tr>
          </thead>

          <tbody>
            <Query
              query={FETCH_VACATION_REQUESTS}
              variables={{ userid: props.id }}
              fetchPolicy="network-only">
              {({ data, loading, error }) => {
                if (loading) {
                  return <LoadingDiv text="Fetching data..." />;
                }

                if (error || !data) {
                  return <ErrorComp error={error} />;
                }

                const [employee] = data.fetchVacationRequests;

                if (employee.vacationRequests.length == 0) {
                  return <div>You haven't requested a vacation yet</div>;
                }

                return employee.vacationRequests
                  .filter(request => request.status != "CANCELLED")
                  .map((request, key) => (
                    <tr key={key}>
                      <td>{moment(request.startdate).format("LL")}</td>
                      <td>{moment(request.enddate).format("LL")}</td>
                      <td>{request.days}</td>
                      <td className="show-icons">
                        <i
                          title={request.status}
                          className={`fal fa-user-${renderIcon(request.status)}`}
                        />
                      </td>
                      <td>
                        <IconButton icon="trash-alt-" onClick={() => setShow(true)} />
                      </td>

                      {show && (
                        <PopupBase
                          close={() => setShow(false)}
                          small={true}
                          styles={{ textAlign: "center" }}
                          buttonStyles={{ justifyContent: "space-around" }}>
                          <h1>Delete Vacation Request</h1>
                          <div>Please confirm the deletion</div>
                          <UniversalButton
                            disabled={loading || success}
                            type="low"
                            label="Cancel"
                            onClick={() => setShow(false)}
                          />
                          <UniversalButton
                            disabled={loading || success}
                            type="high"
                            label="confirm"
                            onClick={() => handleSubmit(mutate)}
                          />
                        </PopupBase>
                      )}
                    </tr>
                  ));
              }}
            </Query>
          </tbody>
        </table>
      </div>
    </Collapsible>
  );
};
