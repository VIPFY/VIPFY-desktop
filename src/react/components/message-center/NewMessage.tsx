import * as React from "react";
import { Mutation } from "react-apollo";
import { QUERY_DIALOG, QUERY_GROUPS, MUTATION_SENDMESSAGE } from "./common";

export default (props: { userid: number; groupid: number }): JSX.Element => {
  let input;

  if (props.groupid === undefined || props.groupid === null) {
    return <span />;
  }

  return (
    <Mutation mutation={MUTATION_SENDMESSAGE} refetchQueries={[]}>
      {(sendMessage, { data }) => (
        <div>
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage({ variables: { message: input.value, groupid: props.groupid } });
              input.value = "";
            }}>
            <textarea
              rows={4}
              cols={50}
              ref={node => {
                input = node;
              }}
            />
            <button type="submit">Send Message</button>
          </form>
        </div>
      )}
    </Mutation>
  );
};
