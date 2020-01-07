import { MutationUpdaterFn } from "react-apollo";
import { useState, ReactElement } from "react";
//import { useApolloClient } from "@apollo/react-hooks";

export function MutationLike(props: {
  update?: MutationUpdaterFn | undefined;
  onError?: ((error: any) => void) | undefined;
  mutation: (...args: any[]) => any;
  children: (
    runMutation: (...args: any[]) => Promise<void>,
    result: { loading: boolean; data: any }
  ) => ReactElement<any> | null;
  client?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const client = props.client;

  return props.children
    ? props.children(
        async (...args) => {
          let d: any = null;
          setLoading(true);
          try {
            d = await props.mutation(...args);
            if (props.update) {
              props.update(client, d);
            }
          } catch (error) {
            if (props.onError) {
              props.onError(error);
            }
          }
          setLoading(false);
          setData(d);
        },
        { loading, data }
      )
    : null;
}
