import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import compose from "lodash.flowright";
import { Link } from "react-router-dom";
import GenericInputForm from "../GenericInputForm";
import { fields } from "./constants";
import { UPLOAD_IMAGES } from "./apollo";

interface Props {
  createApp: Function;
  uploadImages: Function;
  uploadIcon: Function;
}

const CREATE_APP = gql`
  mutation onCreateApp($app: AppInput!, $options: AppOptions) {
    createApp(app: $app, options: $options)
  }
`;

const ServiceCreation = (props: Props) => {
  const handleSubmit = async ({
    images,
    icon,
    logo,
    type,
    emailobject,
    buttonobject,
    passwordobject,
    afterdomain,
    predomain,
    ...app
  }) => {
    try {
      if (!logo || !icon || !images) {
        throw new Error("Please upload pictures");
      }

      app.images = [logo, icon];
      const options = { type, emailobject, buttonobject, passwordobject, afterdomain, predomain };
      // const { data } = await props.createApp({ variables: { app, options } });
      // await props.uploadImages({ variables: { images, appid: data.createApp } });
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <section className="admin">
      <h1>Please create a new Service for Vipfy</h1>
      <GenericInputForm
        onClose={() => console.log("Closed Creation")}
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
