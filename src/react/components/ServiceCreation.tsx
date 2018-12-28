import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import GenericInputForm from "./GenericInputForm";

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

const UPLOAD_IMAGES = gql`
  mutation onUploadAppImages($images: [Upload!]!, $appid: Int!) {
    uploadAppImages(images: $images, appid: $appid)
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

  const fields = [
    {
      name: "name",
      icon: "unicorn",
      type: "text",
      required: true,
      label: "Name of the service",
      placeholder: "Name"
    },
    {
      name: "description",
      icon: "comment",
      type: "textField",
      label: "Description",
      placeholder: "Description for the service's page"
    },
    {
      name: "teaserdescription",
      icon: "comment",
      type: "textField",
      label: "Teaserdescription",
      placeholder: "Short description for the marketplace"
    },
    {
      name: "website",
      icon: "home",
      type: "text",
      required: true,
      label: "Website",
      placeholder: "The Website of the service"
    },
    {
      name: "loginurl",
      icon: "home-heart",
      type: "text",
      required: true,
      label: "Login url",
      placeholder: "The url of the service's login"
    },
    {
      name: "color",
      icon: "palette",
      type: "color",
      required: true,
      label: "Service Color"
    },
    {
      name: "external",
      icon: "landmark-alt",
      type: "checkbox",
      label: "External"
    },
    {
      name: "needssubdomain",
      icon: "child",
      type: "checkbox",
      label: "Needs Subdomain"
    },
    {
      name: "logo",
      type: "picture",
      required: true,
      label: "Logo for the marketplace"
    },
    {
      name: "icon",
      type: "picture",
      required: true,
      label: "Icon for the sidebar"
    },
    {
      name: "images",
      type: "picture",
      required: true,
      label: "Pictures for the service's page",
      multiple: true
    }
  ];

  return (
    <section className="service-creation">
      <h1>Please create a new Service for Vipfy</h1>
      <GenericInputForm
        onClose={() => console.log("Thx Suckers")}
        fields={fields}
        handleSubmit={handleSubmit}
        successMessage="Creation successful"
        defaultValues={{ color: "#000000" }}
      />
    </section>
  );
};

export default compose(
  graphql(CREATE_APP, { name: "createApp" }),
  graphql(UPLOAD_IMAGES, { name: "uploadImages" })
)(ServiceCreation);
