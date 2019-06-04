import * as React from "react";
import UniversalLoginExecutor from "./UniversalLoginExecutor";
import { sleep } from "../common/functions";

interface Props {
  loginUrl: string;
  username: string;
  password: string;
  timeout: number | null;
  partition: string;
  setResult: (
    result: { loggedin: boolean; emailEntered: boolean; passwordEntered: boolean; speed: number },
    image: string
  ) => void;
}

interface State {
  speed: number;
}

class UniversalLoginExecutorWrapper extends React.PureComponent<Props, State> {
  state: { speed: 10 };
  reset() {
    this.setState({ speed: 10 });
  }

  componentDidMount() {
    this.reset();
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.loginUrl != this.props.loginUrl) {
      this.reset();
    }
  }

  render() {
    return (
      <UniversalLoginExecutor
        {...this.props}
        {...this.state}
        timeout={30000 + 10000 / (this.state ? this.state.speed : 1)}
        setResult={(result, image) => {
          if (result.loggedin || this.state.speed < 0.1) {
            return this.props.setResult({ ...result, speed: this.state.speed }, image);
          } else {
            this.setState({ speed: this.state.speed / 3 });
          }
        }}
      />
    );
  }
}

export default UniversalLoginExecutorWrapper;
