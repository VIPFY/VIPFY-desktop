import gql from "graphql-tag";

export const fields = [
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

export const UPLOAD_IMAGES = gql`
  mutation onUploadAppImages($images: [Upload!]!, $appid: Int!) {
    uploadAppImages(images: $images, appid: $appid)
  }
`;
