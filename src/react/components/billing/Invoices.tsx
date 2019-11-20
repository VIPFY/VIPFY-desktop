import * as React from "react";
import { Query, Mutation } from "react-apollo";
import * as moment from "moment";
import { ErrorComp } from "../../common/functions";
import LoadingDiv from "../LoadingDiv";
import { FETCH_BILLS } from "../../queries/billing";
import { filterError } from "../../common/functions";
import { DOWNLOAD_INVOICE } from "../../mutations/billing";
import DropDown from "../../common/DropDown";
import IconButton from "../../common/IconButton";

interface Invoice {
  billtime: string;
  billname: string;
  amount: number;
  currency: string;
  paytime?: string;
  stornotime?: string;
  refundedtime?: string;
  id: string;
}

export default () => {
  const [currentYear, setYear] = React.useState(moment().get("year"));
  const [currentMonths, setMonths] = React.useState([moment.months(moment().get("month"))]);
  const [sortDirection, setDirection] = React.useState("-alt");

  const toggleMonths = month => {
    setMonths(prevMonths => {
      const alreadyIn = prevMonths.find(m => m == month);

      if (alreadyIn) {
        return prevMonths.filter(m => m != month);
      } else {
        return [...prevMonths, month];
      }
    });
  };

  const onEnter = e => {
    if (e.key === "Enter" || e.keyCode === 13) {
      toggleMonths(e.target.name);
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", onEnter, true);

    return function cleanup() {
      window.removeEventListener("keydown", onEnter);
    };
  });

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
          <div className="billing-table-holder" style={{ minHeight: "175px" }}>
            <ul className="billing-period">
              {[...Array(12).keys()].map(i => {
                const month = moment().months(i);

                return (
                  <button
                    key={i}
                    className={`naked-button ${
                      currentMonths.find(m => m == month.format("MMMM")) ? "current" : ""
                    }`}
                    name={month.format("MMM")}
                    onClick={() => toggleMonths(month.format("MMMM"))}>
                    {month.format("MMM")}
                  </button>
                );
              })}
              <DropDown
                option={currentYear}
                defaultValue={currentYear}
                options={yearsList.reverse()}
                handleChange={year => setYear(year)}
              />
            </ul>

            <table>
              <thead>
                <tr>
                  <th>
                    <button
                      className="naked-button"
                      title={`Sort by ${sortDirection == "" ? "oldest" : "newest"}`}
                      onClick={() =>
                        setDirection(prev => {
                          if (prev == "") {
                            return "-alt";
                          } else {
                            return "";
                          }
                        })
                      }>
                      Date <i className={`fal fa-sort-numeric-down${sortDirection}`} />
                    </button>
                  </th>
                  <th>Amount</th>
                  <th colSpan={2}>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody style={{ minHeight: "" }}>
                {Object.values(invoicesByYears[currentYear])
                  .filter((invoice: Invoice) =>
                    currentMonths.find(
                      month => month == moment.months(moment(invoice.billtime).get("month"))
                    )
                  )
                  .sort((a, b) => {
                    if (sortDirection == "") {
                      return a.billtime - b.billtime;
                    } else {
                      return b.billtime - a.billtime;
                    }
                  })
                  .map((invoice: Invoice) => (
                    <tr key={invoice.id}>
                      <td>{moment(invoice.billtime).format("LL")}</td>
                      <td>{`${invoice.amount} ${invoice.currency}`}</td>
                      <td colSpan={2} className="billIcons">
                        <i
                          title={
                            invoice.paytime
                              ? `Paid on ${moment(invoice.paytime).format("LL")}`
                              : "Not paid yet"
                          }
                          className={`fal fa-${
                            invoice.paytime ? "money-bill" : "file-invoice-dollar"
                          }
                         `}
                        />

                        {invoice.stornotime && (
                          <i
                            title={`Cancelled on ${moment(invoice.stornotime).format("LL")}`}
                            className="fal fa-strikethrough"
                          />
                        )}

                        {invoice.refundedtime && (
                          <i
                            title={`Refunded on ${moment(invoice.refundedtime).format("LL")}`}
                            className="fal fa-hand-holding-usd"
                          />
                        )}
                      </td>
                      <td align="right">
                        <Mutation
                          mutation={DOWNLOAD_INVOICE}
                          onCompleted={res => {
                            let link = document.createElement("a");
                            link.download = invoice.billname;
                            link.href = res.downloadBill;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}>
                          {(downloadInvoice, { loading, error }) => (
                            <React.Fragment>
                              <IconButton
                                onClick={() =>
                                  downloadInvoice({ variables: { billid: invoice.id } })
                                }
                                title="Download"
                                icon="download"
                              />
                              {loading && <LoadingDiv text="Downloading Invoice..." />}
                              {error && filterError(error)}
                            </React.Fragment>
                          )}
                        </Mutation>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        );
      }}
    </Query>
  );
};
