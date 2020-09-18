import * as React from "react";
import { Query } from "@apollo/client/react/components";
import { Link } from "react-router-dom";
import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import SearchBox from "../SearchBox";
import { preAppImageUrl } from "../../common/constants";
import Service from "./Service";
import { FETCH_APPS } from "./apollo";

interface Props {
  apps: App[];
}

interface App {
  id: number;
  name: string;
  icon: string;
  disabled: boolean;
  hidden: boolean;
}

const ServiceEdit = (props: Props) => {
  const [seachingFor, setSearch] = React.useState("");
  const [showApp, setShow] = React.useState(null);

  return (
    <section className="admin">
      <h1>Select a Service to edit</h1>
      {showApp ? (
        <Service appid={props.apps.find(app => app.id == showApp)!.id} />
      ) : (
          <React.Fragment>
            <SearchBox searchFunction={(searchValue: string) => setSearch(searchValue)} />
            <div className="apps">
              {props.apps
                .filter(({ name }) => name.toLowerCase().includes(seachingFor.toLowerCase()))
                .map(({ name, id, icon, disabled, hidden }) => (
                  <div
                    title={`${disabled ? "Disabled" : ""} ${hidden ? "Hidden" : ""}`}
                    key={id}
                    className={`app ${disabled ? "disabled" : ""} ${hidden ? "hidden" : ""}`}
                    onClick={() => setShow(id)}>
                    <img height="100px" width="100px" src={`${preAppImageUrl}${icon}`} alt={name} />
                    <h3>{name}</h3>
                  </div>
                ))}
            </div>
          </React.Fragment>
        )}

      <button
        type="button"
        className="button-nav"
        onClick={() => {
          if (showApp) {
            setShow(null);
            setSearch("");
          }
        }}>
        <i className="fal fa-arrow-alt-from-right" />
        {showApp ? <span>Go Back</span> : <Link to="/area/admin">Go Back</Link>}
      </button>
    </section>
  );
};

export default () => (
  <Query query={FETCH_APPS}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv />;
      }

      if (error || !data) {
        return <ErrorComp error={error} />;
      }

      return <ServiceEdit apps={data.adminFetchAllApps} />;
    }}
  </Query>
);
