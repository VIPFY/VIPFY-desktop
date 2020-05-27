import gql from "graphql-tag";

export const SET_VAT_ID = gql`
  mutation onSetVatID($vatID: String!) {
    setVatID(vatID: $vatID) {
      unit: unitid {
        id
      }
      legalinformation
    }
  }
`;

export const EDIT_DEPARTMENT = gql`
  mutation editDepartmentName($departmentid: ID!, $name: String!) {
    editDepartmentName(departmentid: $departmentid, name: $name) {
      ok
    }
  }
`;
