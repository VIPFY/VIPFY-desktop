import * as React from "react";
import { Query, Mutation } from "react-apollo";
import Collapsible from "../../common/Collapsible";
import LoadingDiv from "../../components/LoadingDiv";
import { ErrorComp, renderIcon } from "../../common/functions";
import {
  FETCH_VACATION_REQUESTS,
  DELETE_VACATION_REQUEST
} from "../../components/vacation/graphql";
import moment from "moment";
import UniversalButton from "../universalButtons/universalButton";
import IconButton from "../../common/IconButton";
import PopupBase from "../../popups/universalPopups/popupBase";

interface Props {
  id: number;
}

export default (props: Props) => {
  const [show, setShow] = React.useState(false);

  return (
    <Collapsible title="My Vacation Requests">
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
                  return (
                    <tr>
                      <td>You haven't requested a vacation yet</td>
                    </tr>
                  );
                }

                return employee.vacationRequests
                  .filter(request => request.status != "CANCELLED")
                  .map(request => (
                    <tr key={request.id}>
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
                        <IconButton icon="trash-alt" onClick={() => setShow(true)} />
                      </td>

                      {show && (
                        <Mutation
                          mutation={DELETE_VACATION_REQUEST}
                          update={cache => {
                            const cachedData = cache.readQuery({
                              query: FETCH_VACATION_REQUESTS,
                              variables: { userid: props.id }
                            });

                            // Brute force to enable rerender because the changes are too deeply nested.
                            const fetchVacationRequests = JSON.parse(
                              JSON.stringify(cachedData.fetchVacationRequests)
                            );
                            const requests = fetchVacationRequests[0];

                            requests.vacationRequests = requests.vacationRequests.filter(
                              ({ id }) => request.id != id
                            );
                            fetchVacationRequests[0] = requests;
                            cache.writeQuery({
                              query: FETCH_VACATION_REQUESTS,
                              data: { fetchVacationRequests },
                              variables: { userid: props.id }
                            });

                            setShow(false);
                          }}>
                          {(mutate, { loading: l2, error: e2 }) => (
                            <PopupBase
                              close={() => setShow(false)}
                              small={true}
                              styles={{ textAlign: "center" }}
                              buttonStyles={{ justifyContent: "space-around" }}>
                              <h1>Delete Vacation Request</h1>
                              <div>Please confirm the deletion</div>

                              {l2 && <LoadingDiv />}
                              {e2 && <ErrorComp error={e2} />}

                              <UniversalButton
                                disabled={l2}
                                type="low"
                                label="Cancel"
                                onClick={() => setShow(false)}
                              />

                              <UniversalButton
                                disabled={l2}
                                type="high"
                                label="confirm"
                                onClick={() => mutate({ variables: { id: request.id } })}
                              />
                            </PopupBase>
                          )}
                        </Mutation>
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
