import * as React from "react";
import UniversalLoginExecutor from "./UniversalLoginExecutor";

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  speed: number;
  timeout: number | null;
  partition: string;
  setResult: (result: { loggedin: boolean; errorin: boolean }, image: string) => void;
}

class UniversalLoginExecutorWrapper extends React.PureComponent<Props, State> {
  render() {
    return (
      <UniversalLoginExecutor
        {...this.props}
        {...this.state}
        setResult={(result, image) => {
          return this.props.setResult(result, image);
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
