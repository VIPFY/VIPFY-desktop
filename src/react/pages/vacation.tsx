import * as React from "react";
import Collapsible from "../common/Collapsible";

interface Props {}

export default (props: Props) => {
  return (
    <section className="managerPage">
      <div className="heading">
        <h1>Vacation</h1>
      </div>
      <Collapsible title="Vacation Requests">
        <table>
          <thead>
            <tr>
              <th rowSpan={2}>Name</th>
              <th colSpan={}>Vacation Days</th>
              <th rowSpan={2}>Requests</th>
            </tr>
            <tr>
              <th></th>
              <th>This year</th>
              <th>From last year</th>
              <th>Total</th>
              <th>Taken</th>
              <th>Left</th>
              <th></th>
            </tr>
          </thead>
        </table>
      </Collapsible>
    </section>
  );
};
