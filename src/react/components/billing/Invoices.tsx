import * as React from "react";
import { Query, Mutation } from "react-apollo";
import * as moment from "moment";
// import { shell } from "electron";
// import * as path from "path";
// import * as fs from "fs";
// import * as os from "os";
// import axios from "axios";
// axios.defaults.adapter = require("axios/lib/adapters/http");

import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";

import { FETCH_BILLS } from "../../queries/billing";
import { filterError } from "../../common/functions";
import { DOWNLOAD_INVOICE } from "../../mutations/billing";
import DropDown from "../../common/DropDown";
import IconButton from "../../common/IconButton";

interface Props {}

const Invoices = (props: Props) => {
  const [currentYear, setYear] = React.useState(moment().get("year"));
  const [currentMonth, setMonth] = React.useState(moment.months(moment().get("month")));

  const onEnter = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
      setMonth(e.target.name);
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", onEnter, true);

    return function cleanup() {
      window.removeEventListener("keydown", onEnter);
    };
  });
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

  // toggleInvoice = invoice => {
  //   if (invoice != this.state.show) {
  //     this.setState({ show: invoice });
  //   } else {
  //     this.setState({ show: 0 });
  //   }
  // };

  // toggleMonthInvoice = monthid => {
  //   this.setState({ showmonth: monthid });
  // };

  return (
    <Query query={FETCH_BILLS}>
      {({ data: { fetchBills }, loading, error }) => {
        if (loading) {
          return <LoadingDiv text="Fetching data..." />;
        }

        if (error || !fetchBills) {
          return <ErrorComp error={error} />;
        }

        if (fetchBills.length < 1) {
          return <div className="no-data">No Invoices yet</div>;
        }

        const invoicesByYears = fetchBills.reduce((acc, obj) => {
          const key = moment(obj.billtime).get("year");

          if (!acc[key]) {
            acc[key] = [];
          }

          acc[key].push(obj);
          return acc;
        }, {});

        const yearsList = Object.keys(invoicesByYears).map(year => year);

        return (
          <div className="billing-table-holder">
            <ul className="billing-period">
              {[...Array(12).keys()].map(i => {
                const month = moment().months(i);

                return (
                  <button
                    key={i}
                    className={`naked-button ${
                      month.format("MMMM") == currentMonth ? "current" : ""
                    }`}
                    name={month.format("MMM")}
                    onClick={() => setMonth(month.format("MMMM"))}>
                    {month.format("MMM")}
                  </button>
                );
              })}
              <DropDown
                option={currentYear}
                defaultValue={currentYear}
                options={yearsList}
                handleChange={year => setYear(year)}
              />
            </ul>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th colSpan={2}>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {Object.values(invoicesByYears[currentYear]).map(invoice => (
                  <tr>
                    <td>{moment(invoice.billtime).format("LL")}</td>
                    <td>{invoice.amount}</td>
                    <td colSpan={2} className="billIcons">
                      <IconButton
                        onClick={() => console.log("FIRE")}
                        title={
                          invoice.paytime
                            ? `Paid on ${moment(invoice.paytime).format("LL")}`
                            : "Not paid yet"
                        }
                        icon={invoice.paytime ? "money-bill" : "file-invoice-dollar"}></IconButton>

                      {invoice.stornotime && (
                        <IconButton
                          onClick={() => console.log("FIRE")}
                          title={`Reversed on ${moment(invoice.stornotime).format("LL")}`}
                          icon="strikethrough"></IconButton>
                      )}

                      {invoice.refundedtime && (
                        <IconButton
                          onClick={() => console.log("FIRE")}
                          title={`Refunded on ${moment(invoice.refundedtime).format("LL")}`}
                          icon="hand-holding-usd"></IconButton>
                      )}
                    </td>
                    <td align="right">
                      <IconButton
                        onClick={() => console.log("FIRE")}
                        title="Download"
                        icon="download"></IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        return fetchBills.map(invoice => {
          return <InvoiceMonth key={invoice.id} {...invoice} />;

          monthlyInvoices.push(
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
                {console.log(invoice)}
                <span className="naked-button-holder">
                  <Mutation mutation={DOWNLOAD_INVOICE}>
                    {(downloadInvoice, { loading, error }) => (
                      <button
                        title="Download Invoice"
                        className="naked-button"
                        onClick={() => downloadInvoice({ variables: { billid: invoice.id } })}>
                        <i className="fal fa-download" />
                        {loading && <LoadingDiv text="Downloading Invoice..." />}
                        {error && filterError(error)}
                      </button>
                    )}
                  </Mutation>
                  <i
                    onClick={() => this.toggleInvoice(invoice.id)}
                    className={`fal fa-search-${this.state.show == invoice.id ? "minus" : "plus"}`}
                    title="Show Invoice"
                  />
                </span>
              </div>
              {this.state.show == invoice.id && <InvoiceWebView invoice={invoice.invoicelink} />}
            </React.Fragment>
          );

          thisMonth = newthisMonth;
          lastInvoice = invoice;

          /*if (thisMonth !== newthisMonth && thisMonth !== "") {
                billMonth.push(
                  <div
                    className="genericInsideHolder"
                    key={`${moment(lastInvoice.billtime).format("MMM")}${moment(
                      lastInvoice.billtime
                    ).format("YYYY")}`}>
                    <div
                      className="header"
                      onClick={() =>
                        this.toggleMonthInvoice(
                          `${moment(lastInvoice.billtime).format("MMM")}${moment(
                            lastInvoice.billtime
                          ).format("YYYY")}`
                        )
                      }>
                      <i
                        className={`button-hide fas ${
                          this.state.showmonth ===
                          `${moment(lastInvoice.billtime).format("MMM")}${moment(
                            lastInvoice.billtime
                          ).format("YYYY")}`
                            ? "fa-angle-left"
                            : "fa-angle-down"
                        }`}
                        //onClick={this.toggle}
                      />
                      <span>
                        Invocies for {moment(lastInvoice.billtime).format("MMM")}{" "}
                        {moment(lastInvoice.billtime).format("YYYY")}
                      </span>
                    </div>
                    <div
                      className={`inside ${
                        this.state.showmonth ===
                        `${moment(lastInvoice.billtime).format("MMM")}${moment(
                          lastInvoice.billtime
                        ).format("YYYY")}`
                          ? "in"
                          : "out"
                      }`}>
                      {monthlyInvoices}
                    </div>
                  </div>
                );
                monthlyInvoices = [];
              }*/
          // thisMonth = newthisMonth;
          // lastInvoice = invoice;
        });
        /*monthlyInvoices.push(
              <React.Fragment key={`bill-${lastInvoice.id}`}>
                {console.log(lastInvoice)}
                <div className={`invoices${lastInvoice.refundedtime ? "-refunded" : ""}`}>
                  <span>{`${lastInvoice.amount} ${lastInvoice.currency.toUpperCase()}`}</span>
                  <span
                    onClick={() => this.setState({ show: 0 })}
                    title={
                      lastInvoice.refundedtime
                        ? `Refunded on ${moment(lastInvoice.refundedtime).format("LLL")}`
                        : ""
                    }>
                    {moment(lastInvoice.billtime).format("LLL")}
                  </span>

                  <span className="naked-button-holder">
                    <a href={lastInvoice.pdflink} className="naked-button">
                      <i
                        className="fas fa-download"
                        // onClick={() => this.downloadPdf(lastInvoice.pdflink)}
                      />
                    </a>
                    <i
                      onClick={() => this.toggleInvoice(lastInvoice.id)}
                      className="fas fa-file-invoice-dollar"
                      title="Show Invoice"
                    />
                  </span>
                </div>
                {this.state.show == lastInvoice.id ? (
                  <InvoiceWebView invoice={lastInvoice.invoicelink} />
                ) : (
                  ""
                )}
              </React.Fragment>
            );*/

        /*billMonth.push(
              <div
                className="genericInsideHolder"
                key={`${moment(lastInvoice.billtime).format("MMM")}${moment(
                  lastInvoice.billtime
                ).format("YYYY")}`}>
                <div className="header">
                  Invocies for {moment(lastInvoice.billtime).format("MMM")}{" "}
                  {moment(lastInvoice.billtime).format("YYYY")}
                </div>
              </div>
            );*/
        //console.log(thisMonth, monthlyInvoices);

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
      }}
    </Query>
  );
};

export default Invoices;

interface InvoiceProps {
  invoice: string;
}

interface InvoiceState {
  loading: boolean;
}
// The Webview needs is own class to handle events properly
class InvoiceWebView extends React.Component<InvoiceProps, InvoiceState> {
  state = { loading: true };

  componentDidMount() {
    const webview = document.querySelector("webview");

    webview!.addEventListener("did-start-loading", this.loadstart);
    webview!.addEventListener("did-stop-loading", this.loadstop);
  }

  componentWillUnMount() {
    const webview = document.querySelector("webview");

    webview!.removeEventListener("did-start-loading", this.loadstart);
    webview!.removeEventListener("did-stop-loading", this.loadstop);
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
