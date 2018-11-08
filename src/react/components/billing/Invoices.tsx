import * as React from "react";
import { Query } from "react-apollo";
import * as moment from "moment";
// import { shell } from "electron";
// import * as path from "path";
// import * as fs from "fs";
// import * as os from "os";
// import axios from "axios";
// axios.defaults.adapter = require("axios/lib/adapters/http");

import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";

import { fetchBills } from "../../queries/billing";
import { filterError } from "../../common/functions";
import InvoiceMonth from "./InvoiceMonth";

interface Props {}
interface State {
  show: number;
  showmonth: String;
}

class Invoices extends React.Component<Props, State> {
  state = {
    show: 0,
    showmonth: ""
  };

  // downloadPdf = async pdfLink => {
  //   const pathArray = pdfLink.split("/");
  //   const fileName = pathArray[pathArray.length - 2];
  //   const pdfPath = path.join(os.tmpdir(), fileName);
  //   const res = await axios({
  //     method: "GET",
  //     url: pdfLink,
  //     responseType: "stream"
  //   });

  //   res.data.pipe(fs.createWriteStream(pdfPath));

  //   await new Promise((resolve, reject) => {
  //     res.data.on("end", () => resolve());

  //     res.data.on("error", () => reject());
  //   });

  //   shell.openExternal(pdfPath);
  // };

  toggleInvoice = invoice => {
    if (invoice != this.state.show) {
      this.setState({ show: invoice });
    }

    if (invoice == this.state.show) {
      this.setState({ show: 0 });
    }
  };

  toggleMonthInvoice = monthid => {
    this.setState({ showmonth: monthid });
  };

  render() {
    return (
      <Query query={fetchBills}>
        {({ data: { fetchBills }, loading, error }) => {
          if (loading) {
            return <LoadingDiv text="Fetching data..." />;
          }
          if (error || !fetchBills) {
            return <ErrorComp error={filterError(error)} />;
          }

          if (fetchBills.length > 0) {
            let billmonth: JSX.Element[] = [];
            let thismonth = "";
            let lastinvoice = {};
            let monthlyinvoices: JSX.Element[] = [];

            fetchBills.forEach(invoice => {
              let newthismonth = `${moment(invoice.billtime - 0).format("MMM")}${moment(
                invoice.billtime - 0
              ).format("YYYY")}`;

              if (thismonth !== newthismonth && thismonth !== "") {
                //console.log(thismonth, monthlyinvoices);
                billmonth.push(
                  <InvoiceMonth
                    key={thismonth}
                    monthlyinvoices={monthlyinvoices}
                    lastinvoice={lastinvoice}
                  />
                );
                monthlyinvoices = [];
              }

              monthlyinvoices.push(
                <React.Fragment key={`bill-${invoice.id}`}>
                  <div className={`invoices${invoice.refundedtime ? "-refunded" : ""}`}>
                    <span>{`${invoice.amount} ${invoice.currency.toUpperCase()}`}</span>
                    <span
                      onClick={() => this.setState({ show: 0 })}
                      title={
                        invoice.refundedtime
                          ? `Refunded on ${moment(invoice.refundedtime - 0).format("LLL")}`
                          : ""
                      }>
                      {moment(invoice.billtime - 0).format("LLL")}
                    </span>

                    <span className="naked-button-holder">
                      <a href={invoice.pdflink} className="naked-button">
                        <i
                          className="fal fa-download"
                          // onClick={() => this.downloadPdf(invoice.pdflink)}
                        />
                      </a>
                      <i
                        onClick={() => this.toggleInvoice(invoice.id)}
                        className={`fal fa-search-${
                          this.state.show == invoice.id ? "minus" : "plus"
                        }`}
                        title="Show Invoice"
                      />
                    </span>
                  </div>
                  {this.state.show == invoice.id ? (
                    <InvoiceWebView invoice={invoice.invoicelink} />
                  ) : (
                    ""
                  )}
                </React.Fragment>
              );

              thismonth = newthismonth;
              lastinvoice = invoice;

              /*if (thismonth !== newthismonth && thismonth !== "") {
                billmonth.push(
                  <div
                    className="genericInsideHolder"
                    key={`${moment(lastinvoice.billtime).format("MMM")}${moment(
                      lastinvoice.billtime
                    ).format("YYYY")}`}>
                    <div
                      className="header"
                      onClick={() =>
                        this.toggleMonthInvoice(
                          `${moment(lastinvoice.billtime).format("MMM")}${moment(
                            lastinvoice.billtime
                          ).format("YYYY")}`
                        )
                      }>
                      <i
                        className={`button-hide fas ${
                          this.state.showmonth ===
                          `${moment(lastinvoice.billtime).format("MMM")}${moment(
                            lastinvoice.billtime
                          ).format("YYYY")}`
                            ? "fa-angle-left"
                            : "fa-angle-down"
                        }`}
                        //onClick={this.toggle}
                      />
                      <span>
                        Invocies for {moment(lastinvoice.billtime).format("MMM")}{" "}
                        {moment(lastinvoice.billtime).format("YYYY")}
                      </span>
                    </div>
                    <div
                      className={`inside ${
                        this.state.showmonth ===
                        `${moment(lastinvoice.billtime).format("MMM")}${moment(
                          lastinvoice.billtime
                        ).format("YYYY")}`
                          ? "in"
                          : "out"
                      }`}>
                      {monthlyinvoices}
                    </div>
                  </div>
                );
                monthlyinvoices = [];
              }*/
              // thismonth = newthismonth;
              // lastinvoice = invoice;
            });
            /*monthlyinvoices.push(
              <React.Fragment key={`bill-${lastinvoice.id}`}>
                {console.log(lastinvoice)}
                <div className={`invoices${lastinvoice.refundedtime ? "-refunded" : ""}`}>
                  <span>{`${lastinvoice.amount} ${lastinvoice.currency.toUpperCase()}`}</span>
                  <span
                    onClick={() => this.setState({ show: 0 })}
                    title={
                      lastinvoice.refundedtime
                        ? `Refunded on ${moment(lastinvoice.refundedtime).format("LLL")}`
                        : ""
                    }>
                    {moment(lastinvoice.billtime).format("LLL")}
                  </span>

                  <span className="naked-button-holder">
                    <a href={lastinvoice.pdflink} className="naked-button">
                      <i
                        className="fas fa-download"
                        // onClick={() => this.downloadPdf(lastinvoice.pdflink)}
                      />
                    </a>
                    <i
                      onClick={() => this.toggleInvoice(lastinvoice.id)}
                      className="fas fa-file-invoice-dollar"
                      title="Show Invoice"
                    />
                  </span>
                </div>
                {this.state.show == lastinvoice.id ? (
                  <InvoiceWebView invoice={lastinvoice.invoicelink} />
                ) : (
                  ""
                )}
              </React.Fragment>
            );*/
            billmonth.push(
              <InvoiceMonth
                key={thismonth}
                monthlyinvoices={monthlyinvoices}
                lastinvoice={lastinvoice}
              />
            );
            /*billmonth.push(
              <div
                className="genericInsideHolder"
                key={`${moment(lastinvoice.billtime).format("MMM")}${moment(
                  lastinvoice.billtime
                ).format("YYYY")}`}>
                <div className="header">
                  Invocies for {moment(lastinvoice.billtime).format("MMM")}{" "}
                  {moment(lastinvoice.billtime).format("YYYY")}
                </div>
              </div>
            );*/
            //console.log(thismonth, monthlyinvoices);
            return billmonth;
            /*
              return(
              <React.Fragment key={`bill-${invoice.id}`}>
                {console.log(invoice)}
                <div className={`invoices${invoice.refundedtime ? "-refunded" : ""}`}>
                  <span>{`${invoice.amount} ${invoice.currency.toUpperCase()}`}</span>
                  <span
                    onClick={() => this.setState({ show: 0 })}
                    title={
                      invoice.refundedtime
                        ? `Refunded on ${moment(invoice.refundedtime).format("LLL")}`
                        : ""
                    }>
                    {moment(invoice.billtime).format("LLL")}
                  </span>

                  <span className="naked-button-holder">
                    <a href={invoice.pdflink} className="naked-button">
                      <i
                        className="fas fa-download"
                        // onClick={() => this.downloadPdf(invoice.pdflink)}
                      />
                    </a>
                    <i
                      onClick={() => this.toggleInvoice(invoice.id)}
                      className="fas fa-file-invoice-dollar"
                      title="Show Invoice"
                    />
                  </span>
                </div>
                {this.state.show == invoice.id ? (
                  <InvoiceWebView invoice={invoice.invoicelink} />
                ) : (
                  ""
                )}
              </React.Fragment>)
            ));*/
          }
          return "No Invoices yet";
        }}
      </Query>
    );
  }
}
export default Invoices;

interface InvoiceProps {
  invoice: string;
}

interface InvoiceState {
  loading: boolean;
}
// The Webview needs is own class to handle events properly
class InvoiceWebView extends React.Component<InvoiceProps, InvoiceState> {
  state = {
    loading: true
  };

  componentDidMount() {
    const webview = document.querySelector("webview");

    webview.addEventListener("did-start-loading", this.loadstart);
    webview.addEventListener("did-stop-loading", this.loadstop);
  }

  componentWillUnMount() {
    const webview = document.querySelector("webview");

    webview.removeEventListener("did-start-loading", this.loadstart);
    webview.removeEventListener("did-stop-loading", this.loadstop);
  }

  loadstart = () => this.setState({ loading: true });

  loadstop = () => this.setState({ loading: false });

  render() {
    const { loading } = this.state;

    return (
      <React.Fragment>
        <LoadingDiv text="Fetching Invoice..." style={{ height: loading ? "15rem" : "0" }} />
        <webview
          className="invoices-item"
          style={{ height: loading ? "0" : "" }}
          src={this.props.invoice}
        />
      </React.Fragment>
    );
  }
}
