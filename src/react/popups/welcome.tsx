import * as React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import GenericInputFrom from "../components/GenericInputForm";
import { industries, subIndustries } from "../common/constants";
const UPLOAD_DATA = gql`
  mutation onSaveProposalData($data: ProposalInput!) {
    saveProposalData(data: $data) {
      ok
    }
  }
`;

const UPDATE_STATISTIC_DATA = gql`
  mutation onUpdateStatisticData($data: StatisticInput!) {
    updateStatisticData(data: $data) {
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
  vatId: string;
  statisticData: {
    industry: string;
    country: string;
    subIndustry: string;
    companyStage: string;
  };
  onClose: Function;
  uploadData: Function;
  updateStatisticData: Function;
  disableWelcome: Function;
}

const Welcome = (props: Props) => {
  const { fullName, proposal, onClose, statisticData } = props;
  const { industry, subIndustry, companyStage } = statisticData;
  const defaultValues = {};

  if (proposal) {
    const { name, formatted_address, website, international_phone_number } = proposal;
    defaultValues.name = name;
    defaultValues.formatted_address = formatted_address;
    defaultValues.website = website;
    defaultValues.international_phone_number = international_phone_number;
  }

  const fields = [
    { name: "name", type: "text", icon: "building", disabled: true },
    { name: "formatted_address", type: "text", icon: "address-card" },
    { name: "website", type: "text", icon: "home" },
    { name: "international_phone_number", type: "text", icon: "phone" }
  ];

  if (industry) {
    const industryName = industries.filter(item => item.value == industry);
    defaultValues.industry = industryName[0].name;
    fields.push({ name: "industry", type: "text", icon: "industry", disabled: true });
  }

  if (subIndustry) {
    const subIndustryName = subIndustries[industry].filter(item => item.value == subIndustry);
    defaultValues.subIndustry = subIndustryName[0].title;
    fields.push({ name: "subIndustry", type: "text", icon: "industry", disabled: true });
  }

  if (companyStage) {
    defaultValues.companyStage = companyStage;
    fields.push({ name: "companyStage", type: "text", icon: "chess-rook", disabled: true });
  }

  const handleSubmit = async ({ name, website, international_phone_number }) => {
    try {
      const p1 = props.uploadData({
        variables: {
          data: {
            name,
            address_components: proposal.address_components,
            website,
            international_phone_number
          }
        }
      });
      const p2 = props.updateStatisticData({ variables: { data: statisticData } });

      await Promise.all([p1, p2]);
      props.disableWelcome();
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <div className="welcomeHolderNew">
      <div className="logo" />
      <div className="text">
        <b>{fullName}</b>
        {`, VIPFY is very proud to have you here.
        If you have any questions, we're happy to help you :)`}
      </div>

      {proposal.formatted_address ||
      proposal.website ||
      proposal.international_phone_number ||
      industry ||
      subIndustry ||
      companyStage ? (
        <div className="proposal-holder">
          <div>Do you want to save this data to your account? Just click the field to edit.</div>

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
      ) : (
        ""
      )}
    </div>
  );
};

export default compose(
  graphql(UPDATE_STATISTIC_DATA, {
    name: "updateStatisticData"
  }),
  graphql(UPLOAD_DATA, { name: "uploadData" })
)(Welcome);
