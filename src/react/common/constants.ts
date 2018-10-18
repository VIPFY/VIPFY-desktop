export const unitPicFolder =
  "https://storage.googleapis.com/vipfy-imagestore-01/unit_profilepicture/";
export const iconPicFolder = "https://storage.googleapis.com/vipfy-imagestore-01/icons/";

export const defaultPic = `${unitPicFolder}default.png`;

export const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const countries = [
  { value: "AT", name: "Austria", isEU: true },
  { value: "BE", name: "Belgium", isEU: true },
  { value: "BG", name: "Bulgaria", isEU: true },
  { value: "HR", name: "Croatia", isEU: true },
  { value: "CY", name: "Cyprus", isEU: true },
  { value: "CZ", name: "Czech Republic", isEU: true },
  { value: "DK", name: "Denmark", isEU: true },
  { value: "EE", name: "Estonia", isEU: true },
  { value: "FI", name: "Finland", isEU: true },
  { value: "FR", name: "France", isEU: true },
  { value: "DE", name: "Germany", isEU: true },
  { value: "GR", name: "Greece", isEU: true },
  { value: "HU", name: "Hungary", isEU: true },
  { value: "IE", name: "Ireland", isEU: true },
  { value: "IT", name: "Italy", isEU: true },
  { value: "LV", name: "Latvia", isEU: true },
  { value: "LT", name: "Lithuania", isEU: true },
  { value: "LU", name: "Luxembourg", isEU: true },
  { value: "MT", name: "Malta", isEU: true },
  { value: "NL", name: "Netherlands", isEU: true },
  { value: "PL", name: "Poland", isEU: true },
  { value: "PT", name: "Portugal", isEU: true },
  { value: "RO", name: "Romania", isEU: true },
  { value: "SK", name: "Slovakia", isEU: true },
  { value: "SI", name: "Slovenia", isEU: true },
  { value: "ES", name: "Spain", isEU: true },
  { value: "SE", name: "Sweden", isEU: true },
  { value: "GB", name: "United Kingdom", isEU: true },
  { value: "US", name: "United States of America", isEU: false },
  { value: "OT", name: "Other", isEU: false }
];

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
