import * as React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import * as moment from "moment";
import gql from "graphql-tag";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { Query } from "react-apollo";
import { WorkAround } from "../../interfaces";

interface Participant {
  id: string;
  email: string;
  registrationDate: string;
  dates: string[];
  amountFiles: number;
  totalByteSize: number;
  voucher?: boolean;
}

const FETCH_STUDY_DATA = gql`
  {
    adminFetchStudyData
  }
`;

export default () => {
  const tableHeads = [
    "Email",
    "Registered on",
    "Amount Files",
    "Days used",
    "1. File sent on",
    "KB / File",
    "Received Voucher"
  ];

  function selectIcon(value) {
    if (value === true) {
      return "check";
    } else if (value === false) {
      return "times";
    } else {
      return "slash";
    }
  }

  return (
    <section className="admin" id="click-tracking-study">
      <h1>Click Tracking Study</h1>

      <table>
        <thead>
          <tr>
            {tableHeads.map(head => (
              <th key={head}>{head}</th>
            ))}
          </tr>
        </thead>

        <Query<WorkAround, WorkAround> query={FETCH_STUDY_DATA}>
          {({ data, loading, error }) => {
            if (loading) {
              return <LoadingDiv />;
            }

            if (error || !data) {
              return <ErrorComp error={error} />;
            }
            const participants: Participant[] = data.adminFetchStudyData;

            return (
              <tbody>
                {Object.keys(participants).map(id => (
                  <tr
                    className={classNames(
                      { "lazy-user": participants[id].amountFiles == 0 },
                      { "good-user": selectIcon(participants[id].voucher) == "check" },
                      { "vipfy-user": selectIcon(participants[id].voucher) == "slash" }
                    )}
                    key={id}>
                    <td>{participants[id].email}</td>
                    <td>
                      {participants[id].registrationDate == "-"
                        ? "-"
                        : moment(participants[id].registrationDate).format("DD.MM.YY")}
                    </td>
                    <td>{participants[id].amountFiles}</td>
                    <td>{participants[id].dates.length}</td>
                    <td>
                      {participants[id].dates.length > 0
                        ? participants[id].dates.reduce((acc, cV) => {
                            const momentDate = moment(cV, "DD.MM.YY");

                            return momentDate.isBefore(moment(acc)) ? cV : acc;
                          })
                        : "-"}
                    </td>
                    <td>
                      {participants[id].totalByteSize
                        ? (
                            participants[id].totalByteSize /
                            participants[id].amountFiles /
                            1000
                          ).toFixed(2)
                        : "-"}
                    </td>
                    <td>
                      <i className={`fal fa-user-${selectIcon(participants[id].voucher)}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          }}
        </Query>
      </table>

      <button className="button-nav">
        <i className="fal fa-arrow-alt-from-right" />
        <Link to="/area/admin">Go Back</Link>
      </button>
    </section>
  );
};
