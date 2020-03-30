import * as React from "react";
import gql from "graphql-tag";
import { Query, useMutation } from "react-apollo";
import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../../components/LoadingDiv";
import PopupBase from "./popupBase";
import UniversalButton from "../../components/universalButtons/universalButton";
import { User } from "../../interfaces";
import TwoFactorForm from "../../common/TwoFactorForm";
import { FETCH_USER_SECURITY_OVERVIEW } from "../../components/security/graphqlOperations";
import { WorkAround } from "../../interfaces";

export const GENERATE_SECRET = gql`
  query onGenerateSecret($type: TWOFA_TYPE!, $userid: ID) {
    generateSecret(type: $type, userid: $userid) {
      qrCode
      codeId
      yubikey {
        rp
        user
        pubKeyCredParams
        attestation
        timeout
        challenge
      }
    }
  }
`;

const VERIFY_TOKEN = gql`
  mutation onVerify2FA($userid: ID!, $type: TWOFA_TYPE!, $code: String!, $codeId: ID!) {
    verify2FA(userid: $userid, type: $type, code: $code, codeId: $codeId)
  }
`;

interface Props {
  close?: Function;
  dontClose?: boolean;
  finishSetup?: Function;
  user: User;
}

interface InnerProps extends Props {
  data: {
    qrCode: string;
    codeId: string;
  };
}

const GoogleAuth = (props: InnerProps) => {
  const [showInput, toggleInput] = React.useState(false);
  const [verifyToken, { data, loading, error }] = useMutation(VERIFY_TOKEN, {
    refetchQueries: [{ query: FETCH_USER_SECURITY_OVERVIEW, variables: { userid: props.user.id } }]
  });

  if (data) {
    return (
      <PopupBase
        buttonStyles={{ justifyContent: "center" }}
        small={true}
        close={props.close || null}>
        <section className="auth-apps">
          <h1>Set up your Authenticator</h1>
          <p>
            Set up of your Authenticator was successful. From now on, whenever you sign in to your
            account, you’ll need to enter both your password and also an authentication code sent to
            your mobile device
          </p>
        </section>
        <UniversalButton
          type="high"
          onClick={props.finishSetup ? props.finishSetup : props.close}
          label="ok"
        />
      </PopupBase>
    );
  }

  return (
    <PopupBase
      buttonStyles={{ justifyContent: "space-between" }}
      close={props.dontClose ? null : props.close}
      closeable={props.dontClose ? false : true}
      noSidebar={props.dontClose ? true : false}
      nooutsideclose={props.dontClose ? true : false}
      small={true}>
      <section className="auth-apps">
        <h1>Set up your Authenticator</h1>
        {showInput ? (
          <React.Fragment>
            <p className="sub-header">
              Please enter your 6-digit authentication code from your Authenticator app. "VIPFY"
              will appear below the code
            </p>
            {loading ? (
              <i className="fal fa-spinner fa-spin" />
            ) : (
              <TwoFactorForm
                buttonLabel="confirm"
                handleSubmit={code =>
                  verifyToken({
                    variables: {
                      userid: props.user.id,
                      type: "totp",
                      code,
                      codeId: props.data.codeId
                    }
                  })
                }
                fieldNumber={6}
                seperator={4}
                buttonStyles={{ position: "absolute", bottom: "25px", right: "44px" }}
              />
            )}
            <ErrorComp error={error} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p className="sub-header">
              Download one of the free Authenticator apps for your phone - like Google Authenticator
              -, click add and then scan this QR code to set up your account
            </p>
            <img alt="The QR code to scan" src={props.data.qrCode} width={112} height={111} />
          </React.Fragment>
        )}
      </section>
      {props.close && <UniversalButton type="low" closingPopup={true} label="cancel" />}
      {!showInput && (
        <UniversalButton type="high" label="confirm" onClick={() => toggleInput(true)} />
      )}
    </PopupBase>
  );
};

export default (props: Props) => (
  <Query<WorkAround, WorkAround>
    query={GENERATE_SECRET}
    variables={{ type: "totp", userid: props.user.id }}>
    {({ data, loading, error }) => {
      if (loading) {
        return <LoadingDiv />;
      }

      if (error || !data) {
        return <ErrorComp error={error} />;
      }

      return <GoogleAuth {...props} data={data.generateSecret} />;
    }}
  </Query>
);
