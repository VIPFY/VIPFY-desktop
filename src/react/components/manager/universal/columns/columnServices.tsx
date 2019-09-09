import * as React from "react";
import PrintServiceSquare from "../squares/printServiceSquare";
import { now } from "moment";

interface Props {
  checkFunction: Function;
  appidFunction: Function;
  overlayFunction?: Function;
  services: any[];
  fake?: Boolean;
  style?: Object;
}

interface State {
  numservices: number;
}

class ColumnServices extends React.Component<Props, State> {
  state = { numservices: 6 };
  ref = React.createRef();

  componentDidUpdate() {
    if (
      this.ref &&
      this.ref.current &&
      Math.floor((this.ref.current.offsetWidth - 10) / 40) != this.state.numservices
    ) {
      this.setState({ numservices: Math.floor((this.ref.current.offsetWidth - 10) / 40) });
    }
  }
  render() {
    const { appidFunction, checkFunction, overlayFunction } = this.props;
    let sortedservices: any[] = [];
    let serviceArray: JSX.Element[] = [];
    if (this.props.fake) {
      let fakecounter = 0;
      const amount = Math.random() * 7 + 1;
      for (fakecounter = 0; fakecounter < Math.min(amount, this.state.numservices); fakecounter++) {
        serviceArray.push(
          <div
            key={`key-${fakecounter}`}
            className="managerSquare animateLoading"
            style={{
              color: "#253647",
              backgroundColor: "#F2F2F2",
              fontSize: "12px",
              fontWeight: 400
            }}
          />
        );
      }
    } else {
      this.props.services.forEach(element => {
        if (checkFunction(element)) {
          sortedservices.push(element);
        }
      });
      let counter = 0;
      for (counter = 0; counter < sortedservices.length; counter++) {
        const service = sortedservices[counter];
        if (
          sortedservices.length > this.state.numservices &&
          counter > this.state.numservices - 2
        ) {
          serviceArray.push(
            <div
              key="moreSerivces"
              className="managerSquare"
              style={{
                color: "#253647",
                backgroundColor: "#F2F2F2",
                fontSize: "12px",
                fontWeight: 400
              }}>
              +{sortedservices.length - this.state.numservices + 1}
            </div>
          );
          break;
        } else {
          serviceArray.push(
            <PrintServiceSquare
              key={service.id}
              service={service}
              appidFunction={appidFunction}
              overlayFunction={overlayFunction}
            />
          );
        }
      }
    }
    return (
      <div className="tableColumnBig" style={this.props.style || {}} ref={this.ref}>
        {serviceArray}
      </div>
    );
  }
}
export default ColumnServices;
