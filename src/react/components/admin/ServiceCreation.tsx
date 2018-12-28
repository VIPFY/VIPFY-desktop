import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { Link } from "react-router-dom";
import GenericInputForm from "../GenericInputForm";
import { fields, UPLOAD_IMAGES } from "./constants";

interface Props {
  createApp: Function;
  uploadImages: Function;
  uploadIcon: Function;
}

const CREATE_APP = gql`
  mutation onCreateApp($app: AppInput!) {
    createApp(app: $app)
  }
`;

const ServiceCreation = (props: Props) => {
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
      <h1>Please create a new Service for Vipfy</h1>
      <GenericInputForm
        onClose={() => console.log("Thx Suckers")}
        fields={fields}
        handleSubmit={handleSubmit}
        successMessage="Creation successful"
        defaultValues={{ color: "#000000" }}
      />

      <button className="button-nav">
        <i className="fal fa-arrow-alt-from-right" />
        <Link to="/area/admin">Go Back</Link>
      </button>
    </section>
  );
};

export default compose(
  graphql(CREATE_APP, { name: "createApp" }),
  graphql(UPLOAD_IMAGES, { name: "uploadImages" })
)(ServiceCreation);
