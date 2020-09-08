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
  additionalHeader: boolean;
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
    rowsPerPage: 2,
    currentRows: []
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

  getData() {
    const indexOfLastRow = this.state.currentPage * this.state.rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - this.state.rowsPerPage;

    return this.state.data.slice(indexOfFirstRow, indexOfLastRow);
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
    this.setState({ currentPage: pageNumber });
    const indexOfLastRow = this.state.currentPage * this.state.rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - this.state.rowsPerPage;
    const currentRows = this.state.data.slice(indexOfFirstRow, indexOfLastRow);
    this.setState({ currentRows });
  }

  render() {
    return (
      <section className="table-section">
        {this.props.additionalHeader && (
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
                <p className="row-count-text">Rows per page:</p>
                <DropDown
                  header="Rows per page"
                  option={this.state.rowsPerPage}
                  defaultValue={this.state.rowsPerPage}
                  handleChange={value => this.setState({ rowsPerPage: value, currentPage: 1 })}
                  options={[2, 4]}
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
        )}

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
            {this.getData().map((element, index) => (
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
