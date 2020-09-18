import * as React from "react";
import { Query } from "@apollo/client/react/components";
import gql from "graphql-tag";

export default function OrbitName(props: {
  orbitid: string;
  short?: boolean;
  className?: string;
  showApp?: boolean;
}): JSX.Element {
  const { orbitid } = props;
  const short = props.short === undefined ? false : props.short;
  const showApp = props.showApp === undefined ? false : props.showApp;

  const fetchOrbit = gql`
    query fetchOrbit($orbitid: ID!) {
      fetchOrbit(orbitid: $orbitid) {
        id
        alias
        planid {
          id
          appid {
            id
            name
          }
        }
      }
    }
  `;

  return (
    <Query query={fetchOrbit} variables={{ orbitid }}>
      {({ loading, error = null, data }) => {
        if (loading) {
          return <span />;
        }

        if (error || !data) {
          return <span>(can't fetch orbit data)</span>;
        }

        const orbitData = data.fetchOrbit;

        let returnstring = short ? orbitData.alias.substring(1) : orbitData.alias;
        returnstring += showApp ? ` ${orbitData.panid.appid.name}` : "";

        return (
          <span className={props.className} data-recording-sensitive>
            {returnstring}
          </span>
        );
      }}
    </Query>
  );
}
