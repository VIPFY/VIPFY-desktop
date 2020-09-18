import * as React from "react";
import gql from "graphql-tag";
import { Mutation } from "@apollo/client/react/components";
import { filterError } from "../../common/functions";
import InputField from "../InputField";
import { Domain } from "../../interfaces";

const UPDATE_DNS = gql`
  mutation onUpdateDns($ns: String!, $id: ID!, $action: String!) {
    updateDns(ns: $ns, id: $id, action: $action) {
      id
      domainname
      createdate
      renewaldate
      renewalmode
      whoisprivacy
      external
      status
      dns
    }
  }
`;

interface Props {
  domain: Domain;
}

class NSConfig extends React.Component<Props, {}> {
  render() {
    const { domain } = this.props;

    return (
      <div className="ns-update">
        <h2>Update Nameservers</h2>
        <div className="dns">
          {domain.dns.nameservers.map((ns, key) => (
            <Mutation mutation={UPDATE_DNS}>
              {(updateDns, { error, loading }) => (
                <div key={key} className="ns">
                  {error && <span className="error">{filterError(error)}</span>}
                  <InputField
                    defaultValue={ns}
                    icon="atlas"
                    disabled={loading}
                    label={`Nameserver ${key + 1}`}
                    handleKeyPress={async keyPress => {
                      if (keyPress == "Enter") {
                        await updateDns({
                          variables: {
                            ns: this[`ns-${key}`].state.value,
                            id: domain.id,
                            action: "ADD"
                          }
                        });
                      }
                    }}
                    type="text"
                    name={ns}
                    ref={node => (this[`ns-${key}`] = node)}
                  />

                  <button
                    disabled={loading}
                    onClick={async () => {
                      await updateDns({
                        variables: {
                          ns: this[`ns-${key}`].state.value,
                          id: domain.id,
                          action: "REMOVE"
                        }
                      });
                    }}
                    className="naked-button"
                    title="Remove Nameserver">
                    <i className="fal fa-minus" />
                  </button>
                </div>
              )}
            </Mutation>
          ))}
          <button
            onClick={() => {
              this.props.domain.dns.nameservers.push("");
              this.forceUpdate();
            }}
            className="naked-button"
            title="Add Nameserver">
            <i className="fal fa-plus" />
          </button>
        </div>
      </div>
    );
  }
}

export default NSConfig;
