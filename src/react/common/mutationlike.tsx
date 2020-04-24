import { MutationUpdaterFn, useApolloClient } from "react-apollo";
import { useState, ReactElement } from "react";

export function MutationLike(props: {
  update?: MutationUpdaterFn | undefined;
  onError?: ((error: any) => void) | undefined;
  mutation: (...args: any[]) => any;
  children: (
    runMutation: (...args: any[]) => Promise<void>,
    result: { loading: boolean; error?: Error; data: any }
  ) => ReactElement<any> | null;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const client = useApolloClient();

  return (
    props.children(
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
          setError(error);
        }
        setLoading(false);
        setData(d);
      },
      { loading, error, data }
    ) || null
  );
}
