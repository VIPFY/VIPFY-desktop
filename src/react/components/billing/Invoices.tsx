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

interface Props {}
interface State {
  show: number;
}

class Invoices extends React.Component<Props, State> {
  state = {
    show: 0
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
            return fetchBills.map(invoice => (
              <React.Fragment key={`bill-${invoice.id}`}>
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
              </React.Fragment>
            ));
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
