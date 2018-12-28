import * as React from "react";
import { Link } from "react-router-dom";

export default (props: { props: any }) => {
  const links = [
    { icon: "plus", link: "service-creation", label: "Create a new Service" },
    { icon: "pencil-alt", link: "service-edit", label: "Edit a Service" }
  ];

  return (
    <section className="admin">
      <h1>Admin Interface</h1>
      <ul className="nav">
        {links.map(({ icon, link, label }) => (
          <li className="nav-item" key={link}>
            <i className={`fal fa-${icon}`} />
            <Link to={`admin/${link}`}>{label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
