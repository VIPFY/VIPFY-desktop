import * as React from "react";
import { Domain } from "../../interfaces";
import InputField from "../InputField";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import { filterError, ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";

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

const FETCH_DOMAIN = gql`
  query onFetchDomain($id: ID!) {
    fetchDomain(id: $id) {
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
  onClose: Function;
  id: string;
}

interface State {}

class Configuration extends React.Component<Props, State> {
  state = {};

  render() {
    return (
      <Query query={FETCH_DOMAIN} variables={{ id: this.props.id }}>
        {({ data, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Fetching Domain..." />;
          }

          if (error || !data) {
            return <ErrorComp error={filterError(error)} />;
          }

          if (!data.fetchDomain.dns) {
            data.fetchDomain.dns = [];
          }

          return (
            <div className="domain-configuration">
              <h2>Update Nameservers</h2>
              <div className="dns">
                {data.fetchDomain.dns.map((ns, key) => (
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
                                  id: this.props.id,
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
                                id: this.props.id,
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
                    data.fetchDomain.dns.push("");
                    this.forceUpdate();
                  }}
                  className="naked-button"
                  title="Add Nameserver">
                  <i className="fal fa-plus" />
                </button>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

export default Configuration;
