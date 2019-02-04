import { iconPicFolder, logoPicFolder } from "../../common/constants";

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
    name: "hidden",
    icon: "eye-slash",
    type: "checkbox",
    label: "Hidden"
  },
  {
    name: "disabled",
    icon: "ban",
    type: "checkbox",
    label: "Disabled"
  },
  {
    name: "needssubdomain",
    icon: "child",
    type: "checkbox",
    label: "Needs Subdomain"
  },
  {
    name: "predomain",
    icon: "project-diagram",
    type: "text",
    label: "Pre Domain",
    placeholder: "https://"
  },
  {
    name: "afterdomain",
    icon: "project-diagram",
    type: "text",
    label: "After Domain",
    placeholder: ".appname.com/"
  },
  {
    name: "external",
    icon: "landmark-alt",
    type: "checkbox",
    label: "Create an external plan"
  },
  {
    name: "type",
    icon: "project-diagram",
    type: "number",
    label: "Type"
  },
  {
    name: "emailobject",
    icon: "project-diagram",
    type: "text",
    label: "Email Object",
    placeholder: "input[name='email']"
  },
  {
    name: "buttonobject",
    icon: "project-diagram",
    type: "text",
    label: "Button Object",
    placeholder: "input[type='submit']"
  },
  {
    name: "passwordobject",
    icon: "project-diagram",
    type: "text",
    label: "Password Object",
    placeholder: "input[name='password']"
  },
  /*{
    name: "errorobject",
    icon: "project-diagram",
    type: "text",
    label: "Error Object",
    placeholder: "input[name='error']"
  },*/
  {
    name: "logo",
    type: "picture",
    required: true,
    folder: logoPicFolder,
    label: "Logo for the marketplace"
  },
  {
    name: "icon",
    type: "picture",
    required: true,
    folder: iconPicFolder,
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
