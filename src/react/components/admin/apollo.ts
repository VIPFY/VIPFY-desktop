import gql from "graphql-tag";

export const FETCH_APP = gql`
  query onAdminFetchAppById($id: ID!) {
    adminFetchAppById(id: $id) {
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

export const FETCH_APPS = gql`
  {
    adminFetchAllApps {
      id
      name
      icon
      disabled
      hidden
    }
  }
`;

export const UPLOAD_IMAGES = gql`
  mutation onUploadAppImages($images: [Upload!]!, $appid: ID!) {
    uploadAppImages(images: $images, appid: $appid)
  }
`;
