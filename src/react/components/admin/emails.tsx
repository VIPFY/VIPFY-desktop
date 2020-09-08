import * as React from "react";
import { Query } from "@apollo/client/react/components";
import gql from "graphql-tag";
import { WorkAround } from "./../../interfaces";

const FETCH_INBOUNDEMAILS = gql`
  query adminFetchInboundEmails {
    adminFetchInboundEmails
  }
`;
interface Props {
  moveTo: Function;
}

interface State { }

class Emails extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <Query<WorkAround, WorkAround> query={FETCH_INBOUNDEMAILS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <div>LOADING</div>;
          }

          if (error) {
            return <div>ERROR</div>;
          }
          console.log(data.adminFetchInboundEmails);

          const emails: JSX.Element[] = [];
          if (data.adminFetchInboundEmails) {
            data.adminFetchInboundEmails.forEach(email =>
              emails.push(
                <div onClick={() => this.props.moveTo(`admin/email-integration/${email.id}`)}>
                  Email: {email.subject} | {email.sendtime}
                </div>
              )
            );
          }
          return <div>{emails}</div>;
        }}
      </Query>
    );
  }
}

export default Emails;
