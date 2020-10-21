import * as React from "react";

interface Props {
  service: any;
  appidFunction: Function;
  overlayFunction?: Function;
  additionalStyles?: Object;
  className?: string;
  size?: number;
  fake?: boolean;
}

interface State {}

class PrintServiceSquare extends React.Component<Props, State> {
  render() {
    const { service, appidFunction, overlayFunction, additionalStyles } = this.props;
    const size = this.props.size || 32;
    if (this.props.fake) {
      return (
        <div
          key="fake"
          title="placeholder"
          className={this.props.className || "managerSquare"}
          style={{
            color: "#253647",
            backgroundColor: "#F2F2F2",
            fontSize: "12px",
            fontWeight: 400
          }}
        />
      );
    }
    return (
      <div
        key={service.id}
        title={appidFunction(service).name}
        className={this.props.className || "managerSquare"}
        style={
          appidFunction(service).icon
            ? {
                ...(additionalStyles || {}),
                backgroundImage: `url(https://appimages.vipfy.store/${size}/${size}/fit/${encodeURI(
                  appidFunction(service).icon
                )})`,
                backgroundColor: "unset",
                width: this.props.size,
                height: this.props.size
              }
            : additionalStyles || {}
        }>
        {!appidFunction(service) || appidFunction(service).icon
          ? ""
          : appidFunction(service).name && appidFunction(service).name.slice(0, 1)}
        {overlayFunction && overlayFunction(service)}
      </div>
    );
  }
}
export default PrintServiceSquare;
