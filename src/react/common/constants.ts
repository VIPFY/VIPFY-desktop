export const unitPicFolder =
  "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/";
export const iconPicFolder = "https://storage.googleapis.com/vipfy-imagestore-01/icons/";

export const defaultPic = `${unitPicFolder}default.png`;

export const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const addressFields = [
  {
    type: "text",
    name: "street",
    icon: "road",
    label: "Street",
    placeholder: "Your street",
    required: true
  },
  {
    type: "text",
    name: "zip",
    icon: "sort-numeric-up",
    label: "Zip",
    placeholder: "Your zip code"
  },
  {
    type: "text",
    name: "city",
    icon: "building",
    label: "City",
    placeholder: "Your city",
    required: true
  },
  {
    type: "select",
    name: "country",
    icon: "globe",
    label: "Your country",
    options: ["US", "DE", "FR", "PL", "JP"],
    required: true
  },
  {
    type: "text",
    name: "description",
    icon: "archive",
    label: "Description",
    placeholder: "A short description"
  },
  {
    type: "number",
    name: "priority",
    placeholder: "Select Priority",
    icon: "sort-numeric-up",
    label: "Priority"
  }
];
