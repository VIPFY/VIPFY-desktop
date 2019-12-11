import * as React from "react";
import Collapsible from "../common/Collapsible";
import VacationRequest from "../components/vacation/VacationRequest";

interface Props {}

export default (props: Props) => {
  const users = [{ name: "Hans Dampf", current: 30, lastYear: 5, taken: 8 }];
  return (
    <section id="vacation">
      <div className="heading">
        <h1>Vacation</h1>
      </div>
      <Collapsible title="Vacation Requests">
        <div className="table-holder">
          <table>
            <thead>
              <tr>
                <th vAlign="top" rowSpan={2}>
                  Name
                </th>
                <th colSpan={5} align="center">
                  Vacation Days
                </th>
                <th vAlign="top" rowSpan={2}>
                  Requests
                </th>
                <th rowSpan={2} />
              </tr>
              <tr>
                <th>This year</th>
                <th>From last year</th>
                <th>Total</th>
                <th>Taken</th>
                <th>Left</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, key) => (
                <tr key={key}>
                  <td>{user.name}</td>
                  <td>{`${user.current} days`}</td>
                  <td>{`${user.lastYear} days`}</td>
                  <td>{`${user.current + user.lastYear} days`}</td>
                  <td>{`${user.taken} days`}</td>
                  <td>{`${user.current + user.lastYear - user.taken} days`}</td>
                  <td>None yet</td>
                  <td>Icons</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapsible>

      <VacationRequest />
    </section>
  );
};
