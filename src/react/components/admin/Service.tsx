import * as React from "react";
import gql from "graphql-tag";
import { Query, graphql, compose } from "react-apollo";
import LoadingDiv from "../LoadingDiv";
import { ErrorComp, filterError } from "../../common/functions";
import { fields } from "./constants";
import EditField from "./EditField";
import { FETCH_APP, FETCH_APPS, UPLOAD_IMAGES } from "./apollo";

interface Props {
  appid: number;
  updateApp: Function;
  deleteImage: Function;
}

type Variables = {
  supportid?: number;
  developerid?: number;
  appid?: number;
  app?: object;
  options?: object;
  image?: string;
  id?: number;
  type?: string;
};

const UPDATE_APP = gql`
  mutation onUpdateApp(
    $supportid: ID
    $developerid: ID
    $appid: ID!
    $app: AppInput
    $options: AppOptions
  ) {
    updateApp(
      supportid: $supportid
      developerid: $developerid
      appid: $appid
      app: $app
      options: $options
    ) {
      id
      name
      description
      teaserdescription
      website
      loginurl
      color
      needssubdomain
      logo
      icon
      images
      disabled
      hidden
      options
    }
  }
`;

const DELETE_IMAGE = gql`
  mutation onDeleteImage($image: String!, $id: ID!, $type: String!) {
    deleteImage(image: $image, id: $id, type: $type)
  }
`;

const Service = (props: Props) => {
  const handleSubmit = async (name, value) => {
    try {
      const { appid } = props;

      if (name == "delete") {
        const variables = { id: appid, type: "app", image: value };
        await props.deleteImage({ variables });
      } else {
        const variablesset: Variables = { appid };

        if (
          [
            "type",
            "emailobject",
            "buttonobject",
            "passwordobject",
            "predomain",
            "afterdomain"
          ].find(item => item == name)
        ) {
          variablesset.options = { [name]: value };
        } else {
          variablesset.app = { [name]: value };
        }
        //console.log(variablesset);
        const { data } = await props.updateApp({
          context: { hasUpload: true },
          variables: variablesset
        });

        if (name == "icon" || name == "logo") {
          return data.updateApp[name];
        } else if (name == "image") {
          return data.updateApp.images;
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <Query query={FETCH_APP} variables={{ id: props.appid }}>
      {({ data, loading, error }) => {
        if (loading) {
          return <LoadingDiv text="Fetching Service..." />;
        }

        if (error || !data) {
          return <ErrorComp error={error} />;
        }

        const { id, __typename, options, ...appData } = data.adminFetchAppById;

        const defaultValues = {};
        const app = { ...appData, ...options };
        const filteredFields = fields.filter(field => field.name != "external");

        Object.keys(app).forEach(value => {
          defaultValues[value] = app[value];
        });

        return (
          <section className="service">
            {filteredFields.map(field => {
              return (
                <EditField
                  key={field.name}
                  app={app.name}
                  defaultValue={defaultValues[field.name]}
                  onSubmit={handleSubmit}
                  {...field}
                />
              );
            })}
          </section>
        );
      }}
    </Query>
  );
};

export default compose(
  graphql(UPDATE_APP, { name: "updateApp" }),
  graphql(DELETE_IMAGE, { name: "deleteImage" })
)(Service);
