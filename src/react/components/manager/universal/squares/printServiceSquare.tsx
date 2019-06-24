import * as React from "react";

interface Props {
  service: any;
  appidFunction: Function;
  overlayFunction?: Function;
  additionalStyles?: Object;
  className?: string;
}

interface State {}

class PrintServiceSquare extends React.Component<Props, State> {
  render() {
    const { service, appidFunction, overlayFunction, additionalStyles } = this.props;
    return (
      <div
        key={service.id}
        title={appidFunction(service).name}
        className={this.props.className || "managerSquare"}
        style={
          appidFunction(service).icon
            ? {
                ...(additionalStyles || {}),
                backgroundImage:
                  appidFunction(service).icon.indexOf("/") != -1
                    ? `url(https://s3.eu-central-1.amazonaws.com/appimages.vipfy.store/${encodeURI(
                        appidFunction(service).icon
                      )})`
                    : `url(https://storage.googleapis.com/vipfy-imagestore-01/icons/${encodeURI(
                        appidFunction(service).icon
                      )})`,
                backgroundColor: "unset"
              }
            : additionalStyles || {}
        }>
        {appidFunction(service).icon ? "" : appidFunction(service).name.slice(0, 1)}
        {overlayFunction && overlayFunction(service)}
      </div>
    );
  }
}
export default PrintServiceSquare;
