import * as React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import { ErrorComp, filterError } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import { iconPicFolder } from "../../common/constants";

interface Props {
  createApp: Function;
  uploadImages: Function;
  uploadIcon: Function;
}

const FETCH_APPS = gql`
  {
    adminFetchAllApps {
      id
      name
      icon
    }
  }
`;

const ServiceEdit = (props: Props) => {
  const handleSubmit = async ({ images, icon, logo, ...app }) => {
    try {
      if (!logo || !icon || !images) {
        throw new Error("Please upload pictures");
      }

      app.images = [logo, icon];
      const { data } = await props.createApp({ variables: { app } });
      await props.uploadImages({ variables: { images, appid: data.createApp } });
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <section className="admin">
      <Query query={FETCH_APPS}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Fetching data..." />;
          }
          if (error || !data) {
            return <ErrorComp error={filterError(error)} />;
          }

          return (
            <React.Fragment>
              <h1>Select a Service to edit</h1>
              <div className="apps">
                {data.adminFetchAllApps.map(({ name, id, icon }) => (
                  <div key={id} className="app">
                    <img height="100px" width="100px" src={`${iconPicFolder}${icon}`} alt={name} />
                    <h3>{name}</h3>
                  </div>
                ))}
              </div>
              <button className="button-nav">
                <i className="fal fa-arrow-alt-from-right" />
                <Link to="/area/admin">Go Back</Link>
              </button>
            </React.Fragment>
          );
        }}
      </Query>
    </section>
  );
};

export default ServiceEdit;
