import * as React from "react";
import { NavLink } from "react-router-dom";
import withBreadcrumbs from "react-router-breadcrumbs-hoc";

const Breadcrumbs = ({ breadcrumbs }) => (
  <div className="breadCrumbs">
    {breadcrumbs.map(({ match, breadcrumb }, i: number) => {
      // we don't render the first breadcrumb: it links to "#/", which doesn't work in our app
      if (i == 0) {
        return null;
      }

      return (
        <React.Fragment key={match.url}>
          {i > 1 && <span>{" / "}</span>}

          <span className="breadCrumb">
            <NavLink exact activeClassName="isActive" to={match.url}>
              {breadcrumb.key === "/area" ? "Dashboard" : breadcrumb}
            </NavLink>
          </span>
        </React.Fragment>
      );
    })}
  </div>
);

export default withBreadcrumbs()(Breadcrumbs);
