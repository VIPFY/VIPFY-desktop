import * as React from "react";
import { Link } from "react-router-dom";

export default (_props: any) => {
  const links = [
    { icon: "plus", link: "service-creation", label: "Create a new Service" },
    { icon: "dice-d12", link: "service-creation-external", label: "Create a new External Service" },
    { icon: "pencil-alt", link: "service-edit", label: "Edit a Service" },
    { icon: "brackets-curly", link: "universal-login-test", label: "Test Universal Login" },
    { icon: "ambulance", link: "pending-integrations", label: "Pending Integrations" },
    { icon: "books-medical", link: "service-integration", label: "Service Integration" },
    { icon: "key-skeleton", link: "crypto-debug", label: "Test crypto" },
    { icon: "images", link: "service-logo-overview", label: "Service Logos" },
    { icon: "fist-raised", link: "click-tracking-2020", label: "Click Tracking Study 2020" }
  ];

  return (
    <section className="admin">
      <h1>Admin Interface</h1>
      <div className="nav">
        {links.map(({ icon, link, label }) => (
          <Link to={`admin/${link}`} className="nav-item" key={link}>
            <i className={`fal fa-${icon}`} />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
};
