import * as React from "react";
import { Domain } from "../interfaces";

interface Props {
  domains: Domain[];
}

interface State {}

class DomainShoppingCart extends React.Component<Props, State> {
  state = {};
  render() {
    console.log(this.props.domains);
    return (
      <div>
        <h2>Please configure your domains</h2>
        {this.props.domains.map(domain => (
          <div>
            {domain.domain} {domain.price}
          </div>
        ))}
      </div>
    );
  }
}
export default DomainShoppingCart;
