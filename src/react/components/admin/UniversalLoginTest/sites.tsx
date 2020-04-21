import { TestResult } from "../../../interfaces";

export interface Site {
  app: string;
  url: string;
  email: string;
  password: string;
  testResults?: TestResult[];
  allTestsFinished?: boolean;
}

export const sites: Site[] = [];
