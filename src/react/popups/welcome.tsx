import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import GenericInputFrom from "../components/GenericInputForm";
import { APPLY_PROMOCODE } from "../mutations/auth";

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
    website: string;
    international_phone_number: string;
  };
  vatId: string;
  onClose: Function;
  uploadData: Function;
  updateStatisticData: Function;
  disableWelcome: Function;
  applyPromocode: Function;
}

const Welcome = (props: Props) => {
  const { fullName, proposal, onClose } = props;
  const defaultValues = {};

  if (proposal) {
    const { name, website, international_phone_number } = proposal;
    defaultValues.name = name;
    defaultValues.website = website;
    defaultValues.international_phone_number = international_phone_number;
  }

  const fields = [
    { name: "website", type: "text", icon: "home" },
    { name: "international_phone_number", type: "text", icon: "phone" },
    { name: "promocode", type: "text", placeholder: "promocode", icon: "hand-holding-usd" }
  ];

  const handleSubmit = async ({ website, international_phone_number, promocode }) => {
    try {
      const promises = [
        props.uploadData({
          variables: {
            data: {
              name,
              website,
              international_phone_number
            }
          }
        })
      ];

      if (promocode) {
        promises.push(props.applyPromocode({ variables: { promocode } }));
      }

      await Promise.all(promises);

      props.disableWelcome();
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <div className="welcomeHolderNew">
      <div className="logo" />
      <div className="text">
        <b>{fullName}</b> of <b>{name}</b>
        {`, VIPFY is very proud to have you here.
        If you have any questions, we're happy to help you :)`}
      </div>

      <div className="proposal-holder">
        <div>Here is some data we found about you</div>

        <GenericInputFrom
          submittingMessage="Uploading Data..."
          successMessage="Upload finished. Have fun with Vipfy."
          fields={fields}
          defaultValues={defaultValues}
          onClose={() => {
            props.disableWelcome();
            onClose();
          }}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default compose(
  graphql(APPLY_PROMOCODE, {
    name: "applyPromocode"
  }),
  graphql(UPLOAD_DATA, { name: "uploadData" })
)(Welcome);
