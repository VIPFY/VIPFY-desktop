export interface Licence {
  id: string;
  pending: boolean;
  options: JSON;
  starttime: number | string;
  endtime: number | Date;
  agreed: boolean;
  disabled: boolean;
  key: JSON;
  boughtplanid: BoughtPlan;
  unitid: User;
  tags: string[];
  edit: boolean;
  view: boolean;
  delete: boolean;
  vacationstart?: number | Date;
  vacationend?: number | Date;
  accountid: string;
}

export interface Unit {
  id: string;
  profilepicture: string;
  createdate: string;
}

export interface User extends Unit {
  firstname: string;
  middlename: string;
  lastname: string;
  title: string;
  sex: string;
  birthday: string;
  language: string;
  banned: boolean;
  deleted: boolean;
  suspended: boolean;
  emails: Email[];
  company: Department;
  statisticdata: JSON;
  needspasswordchange: boolean;
  firstlogin: boolean;
  isadmin: boolean;
  companyban: boolean;
  country: string;
  config: JSON;
  color?: string;
}

export interface SecurityUser {
  unitid: any;
  id: string;
  createdate: string;
  lastactive: string;
  passwordlength: number;
  passwordstrength: number;
  banned: boolean;
  suspended: boolean;
  needspasswordchange: boolean;
  needstwofa: boolean;
  twofactormethods: {
    twofaid: string;
    twofatype: string;
    twofacreated: string;
    twofalastused: string;
    twofacount: number;
  }[];
}

export interface PublicUser {
  id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  title: string;
  sex: string;
  birthday: Date;
  language: string;
  profilepicture: string;
  isadmin: boolean;
  companyban: boolean;
}

export interface Department {
  name: string;
  legalinformation: JSON;
  unitid: Unit;
  banned: Boolean;
  deleted: Boolean;
  suspended: Boolean;
  profilepicture: string;
  employees: number;
  manageemployees: Boolean;
  managelicences: Boolean;
  apps: JSON;
  domains: Domain[];
  createdate: string;
  promocode: string;
  setupfinished: Boolean;
}

export interface BoughtPlan {
  id: string;
  buytime: string;
  alias: string;
  endtime: number | Date;
  description: string;
  key: JSON;
  buyer: Unit;
  payer: Unit;
  usedby: Unit;
  planid: Plan;
  licences: Licence[];
  totalprice: number;
}

export interface Domain {
  id: string;
  domainname: string;
  createdate: Date;
  renewaldate: Date;
  renewalmode: string;
  whoisprivacy: boolean;
  statisticdata: JSON;
  dns: DNS;
  boughtplanid: BoughtPlan;
  external: Boolean;
}

export interface DNS {
  nameservers: string[];
}

export interface Email {
  unitid: Unit;
  email: string;
  verified: boolean;
  autogenerated: boolean;
  description: string;
  priority: number;
  tags: string[];
  createdat: Date;
  verifyuntil: Date;
}

export interface Plan {
  id: string;
  name: string;
  teaserdescription: string;
  features: JSON;
  startdate: string;
  enddate: string;
  numlicences: number;
  price: number;
  currency: string;
  options: JSON;
  payperiod: JSON;
  cancelperiod: JSON;
  optional: boolean;
  gototime: string;
  appid: App;
  gotoplan: Plan;
  hidden: boolean;
}

export interface App {
  id: string;
  name: string;
  icon: string;
  loginurl: string;
  description: string;
  teaserdescription: string;
  needssubdomain: boolean;
  website: string;
  disabled: boolean;
  logo: string;
  images: string[];
  features: JSON;
  options: { marketplace?: boolean };
  developer: Unit;
  supportunit: Unit;
  color: string;
  deprecated: boolean;
  hidden: boolean;
  hasboughtplan: boolean;
  category?: string;
  externalid?: string;
}

export interface Option {
  label: any;
  value: any;
}
export interface InputProps {
  name: string;
  form?: string;
  label?: string;
  icon?: string;
  options?: string[] | Option[];
  rows?: number;
  cols?: number;
  style?: object;
  lawLink?: string;
  privacyLink?: string;
  appName?: string;
  autofocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  type: string;
  validate?: Function;
  multiple?: boolean;
  submitting?: boolean;
  submittingMessage?: string;
  runInBackground?: boolean;
  success?: boolean;
  successMessage?: string;
  setError?: Function;
  setValid?: Function;
  defaultValue?: any;
  handleChange?: Function;
  handleKeyPress?: Function;
}

export interface SSO {
  name?: string;
  loginurl?: string;
  email?: string;
  password?: string;
}

export interface WorkAround {
  [basicallyEverything: string]: any;
}

export interface LoginResult {
  loggedIn: boolean;
  error: boolean;
  timedOut?: boolean;
  direct?: boolean;
  emailEntered?: boolean;
  passwordEntered?: boolean;
  domainEntered?: boolean;
  domainNeeded?: boolean;
  unloaded?: boolean;
  tries?: number;
  recaptcha?: boolean;
  emailEnteredEnd?: boolean;
  passwordEnteredEnd?: boolean;
  domainEnteredEnd?: boolean;
  step?: number;
  executeEnd?: boolean;
  currentUrl?: string;
}

export interface TestResult {
  skipped?: boolean; // test was skipped because either a precondition wasn't met or the test would have been redundant
  passed?: boolean;
  timedOut?: boolean;
  screenshot?: string;
  loginResult?: LoginResult;
}

export interface Expired_Plan {
  id: string;
  endtime: Date;
  firstPlan: boolean;
  payperiod: { months?: number; years?: number };
  cancelperiod: { months?: number; years?: number };
  features: {
    teams?: number;
    users?: number;
    integrations?: number;
  };
}

export interface PopUp {
  show: boolean;
  header: string;
  body: any;
  props: any;
  type: string;
  info: string;
}

export interface AppContextContent {
  showPopup: (data: PopUp) => void;
  placeid: string;
  logOut: () => Promise<void>;
  setrenderElements: (any) => void;
  addRenderElement: (any) => void;
  addRenderAction: (any) => void;
  setreshowTutorial: (any) => void;
  references: any[];
}

export type MoveToType = (string) => void;
