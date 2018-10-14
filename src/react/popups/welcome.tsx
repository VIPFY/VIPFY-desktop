import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import GenericInputFrom from "../components/GenericInputForm";

const UPLOAD_DATA = gql`
  mutation onSaveProposalData($data: ProposalInput!) {
    saveProposalData(data: $data) {
      ok
    }
  }
`;

interface Props {
  fullName: string;
  proposal: {
    name: string;
    formatted_address: string;
    website: string;
    international_phone_number: string;
    address_components: object[];
  };
  onClose: Function;
  uploadData: Function;
}

const Welcome = (props: Props) => {
  const { fullName, proposal, onClose } = props;
  const { name, formatted_address, website, international_phone_number } = proposal;

  const defaultValues = {
    name,
    formatted_address,
    website,
    international_phone_number
  };

  const fields = [
    { name: "name", icon: "building" },
    { name: "formatted_address", icon: "address-card" },
    { name: "website", icon: "home" },
    { name: "international_phone_number", icon: "phone" }
  ];

  const handleSubmit = async data => {
    try {
      data.address_components = proposal.address_components;
      await props.uploadData({ variables: { data } });
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <div className="welcomeHolderNew">
      <div className="logo" />
      <div className="text">
        {`${fullName}, VIPFY is very proud to have you here.
        If you have any questions, we're happy to help you :)`}
      </div>

      {proposal ? (
        <div className="proposal-holder">
          <div>Do you want to save this data to your account? Just click the field to edit.</div>

          <GenericInputFrom
            submittingMessage="Uploading Data..."
            successMessage="Upload finished. Have fun with Vipfy."
            fields={fields}
            defaultValues={defaultValues}
            onClose={onClose}
            handleSubmit={handleSubmit}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default graphql(UPLOAD_DATA, { name: "uploadData" })(Welcome);
