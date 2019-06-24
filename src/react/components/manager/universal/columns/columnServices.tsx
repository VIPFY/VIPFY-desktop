import * as React from "react";
import PrintServiceSquare from "../squares/printServiceSquare";

interface Props {
  checkFunction: Function;
  appidFunction: Function;
  overlayFunction?: Function;
  services: any[];
}

interface State {}

class ColumnServices extends React.Component<Props, State> {
  render() {
    const { appidFunction, checkFunction, overlayFunction } = this.props;
    let sortedservices: any[] = [];
    this.props.services.forEach(element => {
      if (checkFunction(element)) {
        sortedservices.push(element);
      }
    });
    let serviceArray: JSX.Element[] = [];
    let counter = 0;
    for (counter = 0; counter < sortedservices.length; counter++) {
      const service = sortedservices[counter];
      if (sortedservices.length > 6 && counter > 4) {
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
            +{sortedservices.length - 5}
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
    return <div className="tableColumnBig">{serviceArray}</div>;
  }
}
export default ColumnServices;
