import * as React from "react";
import { AppIcon } from "@vipfy-private/vipfy-ui-lib";

interface Props {
  appidFunction: Function;
  checkFunction: Function;
  services: any[];

  fake?: boolean;
  overlayFunction?: Function;
  style?: Object;
}

interface State {
  servicesCount: number;
}

class ColumnServices extends React.Component<Props, State> {
  state = { servicesCount: 6 };
  ref = React.createRef();

  componentDidMount() {
    this.calculateNumber();
  }

  componentDidUpdate() {
    this.calculateNumber();
  }

  calculateNumber() {
    if (
      this.ref?.current &&
      Math.floor(this.ref.current.offsetWidth / 40) != this.state.servicesCount
    ) {
      this.setState({ servicesCount: Math.floor(this.ref.current.offsetWidth / 40) });
    }
  }

  render() {
    const { appidFunction, checkFunction } = this.props;

    let sortedServices: any[] = [];
    let serviceElements: JSX.Element[] = [];

    if (this.props.fake || !this.props.services) {
      let fakeCounter = 0;
      const amount = Math.random() * 7 + 1;

      for (
        fakeCounter = 0;
        fakeCounter < Math.min(amount, this.state.servicesCount);
        fakeCounter++
      ) {
        serviceElements.push(
          <div
            key={`key-${fakeCounter}`}
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
      this.props.services.forEach(service => {
        if (checkFunction(service)) {
          sortedServices.push(service);
        }
      });

      for (let i = 0; i < sortedServices.length; i++) {
        const service = sortedServices[i];

        if (sortedServices.length > this.state.servicesCount && i > this.state.servicesCount - 2) {
          serviceElements.push(
            <div
              key="moreSerivces"
              className="managerSquare"
              style={{
                color: "#253647",
                backgroundColor: "#F2F2F2",
                fontSize: "12px",
                fontWeight: 400
              }}>
              +{sortedServices.length - this.state.servicesCount + 1}
            </div>
          );

          break;
        } else {
          const serviceWithID = appidFunction(service);
          serviceElements.push(<AppIcon key={serviceWithID.id} id={serviceWithID.id} size={32} />);
        }
      }
    }

    return (
      <div className="avatarsRow" style={this.props.style} ref={this.ref}>
        {serviceElements}
      </div>
    );
  }
}
export default ColumnServices;
