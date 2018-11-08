import * as React from "react";
import * as moment from "moment";

interface Props {}
interface State {
  show: Boolean;
}

class InvoiceMonth extends React.Component<Props, State> {
  state = {
    show: true
  };

  toggle = (): void => this.setState(prevState => ({ show: !prevState.show }));

  render() {
    //console.log(this.props);
    return (
      <div className="genericInsideHolder">
        <div className="header" onClick={() => this.toggle()}>
          <i
            className={`button-hide fas ${this.state.show ? "fa-angle-left" : "fa-angle-down"}`}
            //onClick={this.toggle}
          />
          <span>
            Invocies for {moment(this.props.lastinvoice.billtime - 0).format("MMM")}{" "}
            {moment(this.props.lastinvoice.billtime - 0).format("YYYY")}
          </span>
        </div>
        <div className={`inside ${this.state.show ? "in" : "out"}`}>
          {this.props.monthlyinvoices}
        </div>
      </div>
    );
  }
}
export default InvoiceMonth;
