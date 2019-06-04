import * as React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import PopupBase from "./popupBase";
import { consentText } from "../../common/constants";
import UniversalButton from "../../components/universalButtons/universalButton";

const SET_CONSENT = gql`
  mutation onSetConsent($consent: Boolean!) {
    setConsent(consent: $consent) {
      id
      consent
    }
  }
`;

interface Props {
  close: Function;
}

export default (props: Props) => (
  <Mutation mutation={SET_CONSENT} onError={props.close} onCompleted={props.close}>
    {setConsent => (
      <PopupBase dialog={true}>
        {consentText}
        <UniversalButton
          onClick={() => {
            setConsent({ variables: { consent: false } });

            window.smartlook("consentIP", false);
            window.smartlook("consentAPI", false);
          }}
          type="low"
          label="Decline"
        />

        <UniversalButton
          onClick={() => {
            setConsent({ variables: { consent: true } });

            window.smartlook("consentIP", consentText);
            window.smartlook("consentAPI", consentText);
          }}
          type="low"
          label="Accept"
        />
      </PopupBase>
    )}
  </Mutation>
);
