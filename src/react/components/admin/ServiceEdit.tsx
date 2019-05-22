import * as React from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import { ErrorComp, filterError } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import SearchBox from "../SearchBox";
import { iconPicFolder } from "../../common/constants";
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

interface State {
  apps: App[];
  seachringFor: string;
  showApp: null | number;
}

class ServiceEdit extends React.Component<Props, State> {
  state = {
    apps: [],
    seachringFor: "",
    showApp: null
  };

  searchApp = (searchValue: string) => this.setState({ seachringFor: searchValue });

  render() {
    const { showApp, seachringFor } = this.state;

    return (
      <section className="admin">
        <h1>Select a Service to edit</h1>
        {showApp ? (
          <Service appid={this.props.apps.find(app => app.id == showApp)!.id} />
        ) : (
          <React.Fragment>
            <SearchBox searchFunction={this.searchApp} />
            <div className="apps">
              {this.props.apps
                .filter(({name}) => name.toLowerCase().includes(seachringFor.toLowerCase()))
                .map(({ name, id, icon, disabled, hidden }) => (
                  <div
                    title={`${disabled ? "Disabled" : ""} ${hidden ? "Hidden" : ""}`}
                    key={id}
                    className={`app ${disabled ? "disabled" : ""} ${hidden ? "hidden" : ""}`}
                    onClick={() => this.setState({ showApp: id })}>
                    <img height="100px" width="100px" src={`${iconPicFolder}${icon}`} alt={name} />
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
              this.setState({ showApp: null, seachringFor: "" });
            }
          }}>
          <i className="fal fa-arrow-alt-from-right" />
          {showApp ? <span>Go Back</span> : <Link to="/area/admin">Go Back</Link>}
        </button>
      </section>
    );
  }
}

export default () => (
  <Query query={FETCH_APPS}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv text="Fetching Services..." />;
      }

      if (error || !data) {
        return <ErrorComp error={filterError(error)} />;
      }

      return <ServiceEdit apps={data.adminFetchAllApps} />;
    }}
  </Query>
);
