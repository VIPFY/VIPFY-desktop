import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import LoadingDiv from "../components/LoadingDiv";
import { ErrorComp } from "../common/functions";

const UPLOAD_DATA = gql`
  mutation onSaveProposalData($data: ProposalInput!) {
    saveProposalData(data: $data) {
      ok
    }
  }
`;

export default ({ name, proposal, onClose }) => {
  return (
    <div className="welcomeHolderNew">
      <div className="logo" />
      <div className="text">
        {`${name}, VIPFY is very proud to have you here.
        If you have any questions, we're happy to help you :)`}
      </div>

      {proposal ? (
        <div className="proposal">
          <p>Do you want to save this data to your account?</p>

          <p className="proposal-company">
            <img src={proposal.icon} alt="logo" />
            <span>{proposal.name}</span>
          </p>

          <p className="proposal-address">
            <i className="fas fa-address-card" />
            <span> {proposal.formatted_address}</span>
          </p>

          <p className="proposal-website">
            <i className="fas fa-home" />
            <span> {proposal.website}</span>
          </p>

          <p className="proposal-phone">
            <i className="fas fa-phone" />
            <span> {proposal.international_phone_number}</span>
          </p>

          <Mutation mutation={UPLOAD_DATA}>
            {(saveProposalData, { loading, error }) => (
              <React.Fragment>
                {loading ? (
                  <LoadingDiv text="Uploading Data..." />
                ) : error ? (
                  <ErrorComp error="Sorry, something went wrong. Please retry." />
                ) : (
                  ""
                )}
                <div className="generic-button-holder">
                  <button
                    type="button"
                    disabled={loading}
                    className="generic-cancel-button"
                    onClick={onClose}>
                    <i className="fas fa-long-arrow-alt-left" /> Cancel
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await saveProposalData({ variables: { data: proposal } });
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                    disabled={loading}
                    className="generic-submit-button">
                    <i className="fas fa-check-circle" />
                    Submit
                  </button>
                </div>
              </React.Fragment>
            )}
          </Mutation>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
