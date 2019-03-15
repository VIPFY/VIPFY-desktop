export interface Licence {
  id: number;
  options: JSON;
  starttime: string;
  endtime: Date;
  agreed: boolean;
  disabled: boolean;
  key: JSON;
  boughtplanid: BoughtPlan;
  unitid: User;
  layoutvertical: number;
  layouthorizontal: number;
}

export interface Unit {
  id: number;
  profilepicture: string;
  createdate: string;
}

export interface User {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  title: string;
  sex: string;
  birthday: string;
  resetoption: number;
  language: string;
  banned: boolean;
  deleted: boolean;
  suspended: boolean;
  profilepicture: string;
  emails: Email[];
  createdate: string;
  company: Department;
  statisticdata: JSON;
  needspasswordchange: boolean;
  firstlogin: boolean;
  isadmin: boolean;
  companyban: boolean;
  country: string;
  config: JSON;
}

export interface PublicUser {
  id: number;
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
  employeedata: PublicUser[];
  manageemployees: Boolean;
  managelicences: Boolean;
  apps: JSON;
  domains: Domain[];
  createdate: string;
  promocode: string;
  setupfinished: Boolean;
}

export interface BoughtPlan {
  id: number;
  buytime: string;
  alias: string;
  endtime: string;
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
  id: number;
  domainname: string;
  createdate: Date;
  renewaldate: Date;
  renewalmode: string;
  whoisprivacy: boolean;
  statisticdata: JSON;
  dns: JSON;
  boughtplanid: BoughtPlan;
  external: Boolean;
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
  id: number;
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
  id: number;
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
  options: JSON;
  developer: Unit;
  supportunit: Unit;
  color: string;
  deprecated: boolean;
  hidden: boolean;
  hasboughtplan: boolean;
}

interface Option {
  name: string;
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
}

export interface Domain {
  domain: string;
  price: string;
  currency: string;
  availability: string;
  description: string;
}
