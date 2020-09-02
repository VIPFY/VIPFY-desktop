import * as React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import * as moment from "moment";
import gql from "graphql-tag";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp } from "../../common/functions";
import { Query, Mutation } from "react-apollo";
import { WorkAround } from "../../interfaces";
import Duration from "../../common/duration";
import IconButton from "../../common/IconButton";

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

const FINISH_STUDY = gql`
  mutation onFinishStudy($participantID: ID!) {
    finishStudy(participantID: $participantID)
  }
`;

const CANCEL_FINISH = gql`
  mutation onCancelFinishStudy($participantID: ID!) {
    cancelFinishStudy(participantID: $participantID)
  }
`;

export default () => {
  const [sortBy, setSort] = React.useState({ column: "registerDate", direction: "down" });
  const [_onlyForUpdate, forceUpdate] = React.useState(false);

  const tableHeads = [
    { label: "Email" },
    { label: "Registered on", sort: "registerDate" },
    { label: "Amount Files", sort: "amount" },
    { label: "Days used", sort: "daysUsed" },
    { label: "1. File sent" },
    { label: "KB / File", sort: "size" },
    { label: "Received Voucher" }
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

  const computeTotalSize = user => (user.totalByteSize / user.amountFiles / 1000).toFixed(2);

  return (
    <section className="admin" id="click-tracking-study">
      <h1>Click Tracking Study</h1>

      <Query<WorkAround, WorkAround> query={FETCH_STUDY_DATA}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv />;
          }

          if (error || !data) {
            return <ErrorComp error={error} />;
          }
          const participants: Participant[] = data.adminFetchStudyData;
          const list = Object.keys(participants);
          const vipfyUsers = list.filter(id => participants[id].voucher === null).length;

          return (
            <React.Fragment>
              <ul className="statistics">
                <li>
                  <span>Total number of participants:</span>
                  {list.length}
                </li>

                <li>
                  <span>Number of VIPFY participants:</span>
                  {vipfyUsers}
                </li>

                <li title="VIPFY Participants are subtracted from the total number">
                  <span>
                    Regular Participants:
                    <i className="fal fa-info-circle" />
                  </span>
                  {list.length - vipfyUsers}
                </li>

                <li>
                  <span>Participants who send data:</span>
                  {list.filter(id => participants[id].dates.length > 0).length}
                </li>

                <li title="Without VIPFY Participants">
                  <span>
                    Participants who finished the study:
                    <i className="fal fa-info-circle" />
                  </span>
                  {list.filter(id => participants[id].voucher).length}
                </li>
              </ul>

              <table>
                <thead>
                  <tr>
                    {tableHeads.map(head => (
                      <th
                        key={head.label}
                        onClick={() =>
                          head.sort &&
                          setSort(oldState => ({
                            column: head.sort,
                            direction: oldState.direction == "down" ? "up" : "down"
                          }))
                        }>
                        {head.label}
                        {head.sort && <i className="fal fa-sort" />}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {list
                    .sort((a, b) => {
                      let first, second;

                      if (sortBy.column == "size") {
                        first = parseFloat(computeTotalSize(participants[a]));
                        second = parseFloat(computeTotalSize(participants[b]));
                      } else if (sortBy.column == "amount") {
                        first = participants[a].amountFiles;
                        second = participants[b].amountFiles;
                      } else if (sortBy.column == "registerDate") {
                        first = moment(participants[a].registrationDate);
                        second = moment(participants[b].registrationDate);
                      } else if (sortBy.column == "daysUsed") {
                        first = participants[a].dates.length;
                        second = participants[b].dates.length;
                      }

                      return sortBy.direction == "down" ? first - second : second - first;
                    })
                    .map(id => (
                      <tr
                        className={classNames(
                          { "lazy-user": participants[id].amountFiles == 0 },
                          { "good-user": selectIcon(participants[id].voucher) == "check" },
                          { "vipfy-user": selectIcon(participants[id].voucher) == "slash" },
                          {
                            "study-finished":
                              participants[id].registrationDate != "-" &&
                              moment(moment()).diff(participants[id].registrationDate, "days") >=
                                30 &&
                              moment().diff(
                                moment(
                                  participants[id].dates.reduce((acc, cV) => {
                                    return moment(cV, "DD.MM.YY").isBefore(moment(acc, "DD.MM.YY"))
                                      ? cV
                                      : acc;
                                  }, "01.01.30"),
                                  "DD.MM.YY"
                                ),
                                "days"
                              ) >= 28 &&
                              participants[id].amountFiles >= 336
                          }
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
                          {participants[id].dates.length > 0 ? (
                            <Duration
                              postfix=" ago"
                              timestamp={moment(
                                participants[id].dates.reduce((acc, cV) => {
                                  return moment(cV, "DD.MM.YY").isBefore(moment(acc, "DD.MM.YY"))
                                    ? cV
                                    : acc;
                                }, "01.01.30"),
                                "DD.MM.YY"
                              )}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {participants[id].totalByteSize
                            ? computeTotalSize(participants[id])
                            : "-"}
                        </td>
                        <td>
                          <Mutation<WorkAround, WorkAround>
                            update={proxy => {
                              const data = proxy.readQuery({ query: FETCH_STUDY_DATA });

                              data.adminFetchStudyData[id].voucher = !data.adminFetchStudyData[id]
                                .voucher;
                              forceUpdate(prev => !prev);
                              proxy.writeQuery({ query: FETCH_STUDY_DATA, data });
                            }}
                            mutation={participants[id].voucher ? CANCEL_FINISH : FINISH_STUDY}>
                            {(mutate, { loading, error }) => (
                              <React.Fragment>
                                <IconButton
                                  disabled={loading}
                                  icon={`user-${selectIcon(participants[id].voucher)}`}
                                  onClick={() =>
                                    mutate({ variables: { participantID: participants[id].id } })
                                  }
                                />

                                <ErrorComp error={error} />
                              </React.Fragment>
                            )}
                          </Mutation>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </React.Fragment>
          );
        }}
      </Query>

      <button className="button-nav">
        <i className="fal fa-arrow-alt-from-right" />
        <Link to="/area/admin">Go Back</Link>
      </button>
    </section>
  );
};
