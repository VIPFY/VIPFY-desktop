import * as React from "react";
import { NavLink } from "react-router-dom";
import withBreadcrumbs from "react-router-breadcrumbs-hoc";
import routes from "../routes";

const Breadcrumbs = ({ breadcrumbs }) => (
  <div className="breadCrumbs">
    {breadcrumbs.map(({ match, breadcrumb }, i: number) => {
      // don't render the first breadcrumb: it links to "#/", which doesn't work in our app
      if (i == 0) {
        return null;
      }

      return (
        <React.Fragment key={match.url}>
          {i > 1 && <span className="breadCrumbSeparator">{"/"}</span>}

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

// FIXME: The "routes" param doesn't seem to be respected while the routes are also imported in area.tsx.
export default withBreadcrumbs(routes)(Breadcrumbs);
