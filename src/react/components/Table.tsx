import * as React from "react";
import DropDown from "../common/DropDown";
import Pagination from "./Pagination";
import DropDownWithIcon from "./DropDownWithIcon";
import UniversalCheckbox from "./universalForms/universalCheckbox";
import UniversalTextInput from "./universalForms/universalTextInput";

interface Props {
  title: string;
  headers: { headline: string; sortable?: boolean }[];
  tableData: object[];
  dropDown: JSX.Element;
}

interface State {
  data: object[];
  search: string;
  sort: string;
  sortForward: boolean;
  checkBoxStatusArray: object;
  isAllRowsCheckboxChecked: boolean;
  currentPage: number;
  rowsPerPage: number;
  currentRows: object[];
}

class Table extends React.Component<Props, State> {
  state = {
    data: this.props.tableData,
    search: "",
    sort: "",
    sortForward: false,
    checkBoxStatusArray: this.initializeArray(),
    isAllRowsCheckboxChecked: false,
    currentPage: 1,
    rowsPerPage: 20,
    currentRows: this.getCurrentRows(this.props.tableData, 1, 20)
  };

  getWidth() {
    if (!this.props.headers) {
      return "100%";
    }

    return Math.round(100 / this.props.headers.length);
  }

  initializeArray() {
    let array = [];
    if (this.props.tableData.length) {
      this.props.tableData.forEach((_, index) => {
        array[index] = false;
      });
    }
    return array;
  }

  sortTable(sorted: any) {
    let { data, sortForward } = this.state;
    data.sort(function (a, b) {
      let stringA = "";
      let stringB = "";
      a.forEach(element => {
        if (element.header === sorted) {
          stringA = `${element.index}`.toUpperCase();
        }
      });
      b.forEach(element => {
        if (element.header === sorted) {
          stringB = `${element.index}`.toUpperCase();
        }
      });

      if (stringA < stringB) {
        return sortForward ? -1 : 1;
      }

      if (stringA > stringB) {
        return sortForward ? 1 : -1;
      }

      return 0;
    });
  }

  searchTerm(searchTerm: String) {
    if (!searchTerm) {
      this.setState({ data: this.props.tableData });
      return;
    }

    const data = [];

    this.props.tableData.map(element => {
      element.map(e => {
        if (
          `${e.index}`.toUpperCase().includes(searchTerm.toUpperCase()) &&
          !data.includes(element)
        ) {
          data.push(element);
        }
      });
    });

    this.setState({ data });
  }

  handleSortClick(sorted: any) {
    if (sorted !== this.state.sort) {
      this.setState({ sortForward: true, sort: sorted });
    } else {
      this.setState(oldstate => {
        return { sortForward: !oldstate.sortForward };
      });
    }

    this.sortTable(sorted);
  }

  checkOrUncheckAllRows(check: boolean) {
    let checkBoxStatusArray = [];

    this.state.data.forEach((_, i) => {
      checkBoxStatusArray[i] = check;
    });

    this.setState({ isAllRowsCheckboxChecked: check, checkBoxStatusArray: checkBoxStatusArray });
  }

  setRowsCheckboxStati(e, i) {
    this.setState({ isAllRowsCheckboxChecked: false });
    this.setState(
      oldstate =>
        (oldstate.checkBoxStatusArray[i] = e && !this.state.checkBoxStatusArray.includes(i))
    );
  }

  goToPage(pageNumber) {
    const currentRows = this.getCurrentRows(
      this.state.data,
      this.state.currentPage,
      this.state.rowsPerPage
    );
    this.setState({ currentRows, currentPage: pageNumber });
  }

  getCurrentRows(data, currentPage, rowsPerPage) {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;

    return data.slice(indexOfFirstRow, indexOfLastRow);
  }

  render() {
    return (
      <section className="table-section">
        <div className="extended-header">
          <div className="row extended-header-row">
            <div className="colSm">
              <UniversalTextInput
                id="tablesearchbox"
                placeHolder="Search"
                livevalue={v => this.searchTerm(v)}
                icon="far fa-search"
              />
            </div>
            <div className="colSm extended-header-right-col">
              <p className="row-count-text">Rows per Page:</p>
              <DropDown
                header="rowsPerPage"
                option={this.state.rowsPerPage}
                defaultValue={20}
                handleChange={(value: number) =>
                  this.setState({
                    rowsPerPage: value,
                    currentPage: 1,
                    currentRows: this.props.tableData.slice(0, value)
                  })
                }
                options={[10, 20, 50]}
              />
              <Pagination
                rowsPerPage={this.state.rowsPerPage}
                totalRows={this.state.data.length}
                goToPage={pageNumber => this.goToPage(pageNumber)}
                currentPage={this.state.currentPage}
              />
            </div>
          </div>
        </div>

        <div className="table">
          <div className="table-rows table-header">
            <div className="table-checkbox-column">
              <UniversalCheckbox
                name={"checkOrUncheckAllRows"}
                liveValue={check => this.checkOrUncheckAllRows(check)}
                startingvalue={this.state.isAllRowsCheckboxChecked}
              />
            </div>
            <div className="table-body-cols">
              {this.props.headers &&
                this.props.headers.map(header => (
                  <div
                    className="table-col"
                    style={{ width: this.getWidth() + "%" }}
                    onClick={() => {
                      this.handleSortClick(header.headline);
                    }}
                    key={header.headline}>
                    {header.headline}
                    {header.sortable &&
                      (header.headline === this.state.sort ? (
                        this.state.sortForward ? (
                          <i className="fad fa-sort-up sortIcon"></i>
                        ) : (
                          <i className="fad fa-sort-down sortIcon"></i>
                        )
                      ) : (
                        <i className="fas fa-sort sortIcon" style={{ opacity: 0.4 }}></i>
                      ))}
                  </div>
                ))}
            </div>
            {this.props.dropDown && <div className="table-dropdown-col" />}
          </div>
          <div className="table-body" style={{ flexDirection: "column" }}>
            {this.state.currentRows.map((element, index) => (
              /* I am using index as key as element is an array of objects */
              <div className="table-rows" key={index}>
                <div className="table-checkbox-column">
                  <UniversalCheckbox
                    name={`table-${index}`}
                    liveValue={e => {
                      this.setRowsCheckboxStati(e, index);
                    }}
                    startingvalue={this.state.checkBoxStatusArray[index]}
                  />
                </div>
                <div className="table-body-cols">
                  {element.map(data => (
                    <div
                      className="table-col"
                      style={{ width: this.getWidth() + "%" }}
                      key={data.header}>
                      {data.component}
                    </div>
                  ))}
                </div>
                {this.props.dropDown && (
                  <div className="table-dropdown-col">
                    <DropDownWithIcon dropDownComponent={this.props.dropDown} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
export default Table;
