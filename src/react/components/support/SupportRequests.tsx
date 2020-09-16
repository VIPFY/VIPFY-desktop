import * as React from "react";
import gql from "graphql-tag";
import { Query } from "@apollo/client/react/components";
import Collapsible from "../../common/Collapsible";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";

export const GET_REQUESTS = gql`
  {
    fetchSupportRequests
  }
`;

interface Props { }

export default (props: Props) => {
  return (
    <Collapsible title="Support Requests">
      <Query query={GET_REQUESTS} pollInterval={60 * 10 * 3000}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data) {
            return <ErrorComp error={error} />;
          }

          if (!data.fetchSupportRequests || data.fetchSupportRequests < 1) {
            return <div style={{ padding: "20px" }}>You don't have any Support Tickets</div>;
          }

          return (
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>App</th>
                </tr>
              </thead>

              <tbody>
                {data.fetchSupportRequests.map(request => {
                  console.log("LOG: request", request);

                  return (
                    <tr key={request.id}>
                      <td>{request.topic}</td>
                      <td>{request.status}</td>
                      <td>{request.createdDate}</td>
                      <td>
                        {request.labels.find(label => label == "external-app")
                          ? request.labels.filter(label => label != "external-app")[0]
                          : "VIPFY"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        }}
      </Query>
    </Collapsible>
  );
};
