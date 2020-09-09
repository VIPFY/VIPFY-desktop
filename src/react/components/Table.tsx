import * as React from "react";
import DropDown from "../common/DropDown";
import Pagination from "./Pagination";
import DropDownWithIcon from "./DropDownWithIcon";
import UniversalCheckbox from "./universalForms/universalCheckbox";
import UniversalTextInput from "./universalForms/universalTextInput";

interface TableCell {
  component: JSX.Element;
  searchableText?: string;
}

interface TableRow {
  cells: TableCell[];
}

interface Props {
  title: string;
  headers: { headline: string; sortable?: boolean }[];
  data: TableRow[];
  actionButtonComponent: JSX.Element;
}

interface State {
  data: TableRow[];
  currentRows: TableRow[];
  selectedRows: TableRow[];
  rowsPerPage: number;
  currentPage: number;
  search: string;
  sortBy: string;
  sortAscending: boolean;
  isAllRowsCheckboxChecked: boolean;
}

class Table extends React.Component<Props, State> {
  state = {
    data: this.props.data,
    currentPage: 1,
    rowsPerPage: 20,
    currentRows: this.getCurrentRows(this.props.data, 1, 20),
    search: "",
    sortBy: "",
    sortAscending: false,
    selectedRows: [],
    isAllRowsCheckboxChecked: false
  };

  getWidth() {
    if (!this.props.headers) {
      return "100%";
    }

    return Math.round(100 / this.props.headers.length);
  }

  initializeArray() {
    let array = [];
    if (this.props.data.length) {
      this.props.data.forEach((_, index) => {
        array[index] = false;
      });
    }
    return array;
  }

  searchTerm(searchTerm: String) {
    if (!searchTerm) {
      this.setState({ data: this.props.data });
      return;
    }

    const data = [];

    this.props.data.map(row => {
      row.cells.map(cell => {
        if (
          `${cell.searchableText}`.toUpperCase().includes(searchTerm.toUpperCase()) &&
          !data.includes(row)
        ) {
          data.push(row);
        }
      });
    });

    this.setState({ data });
  }

  handleSortClick(sortBy: string) {
    const sortAscending = sortBy === this.state.sortBy ? !this.state.sortAscending : true;
    const columnIndex = this.props.headers.findIndex(header => header.headline === sortBy);

    const sortedData = this.state.data.sort(function (rowA: TableRow, rowB: TableRow) {
      const stringA = rowA.cells[columnIndex].searchableText;
      const stringB = rowB.cells[columnIndex].searchableText;
      const comparison = stringA.localeCompare(stringB, undefined, { sensitivity: "base" });

      return sortAscending ? comparison : -comparison;
    });

    this.setState({ data: sortedData, sortBy, sortAscending });
    this.goToPage(1);
  }

  checkOrUncheckAllRows(check: boolean) {
    this.setState(oldState => {
      return {
        isAllRowsCheckboxChecked: check,
        selectedRows: check
          ? this.getCurrentRows(oldState.data, oldState.currentPage, oldState.rowsPerPage)
          : []
      };
    });
  }

  updateRowSelection(row: TableRow, checked: boolean) {
    this.setState(oldState => {
      let selectedRows = oldState.selectedRows;

      if (checked) {
        selectedRows.push(row);
      } else {
        selectedRows.splice(
          selectedRows.findIndex(selRow => selRow === row),
          1
        );
      }

      return {
        isAllRowsCheckboxChecked: false,
        selectedRows
      };
    });
  }

  goToPage(pageNumber: number) {
    const currentRows = this.getCurrentRows(
      this.state.data,
      this.state.currentPage,
      this.state.rowsPerPage
    );

    this.setState({ currentRows, currentPage: pageNumber });
  }

  getCurrentRows(data: TableRow[], currentPage: number, rowsPerPage: number) {
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
                    currentRows: this.props.data.slice(0, value)
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
                      (header.headline === this.state.sortBy ? (
                        this.state.sortAscending ? (
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
            {this.props.actionButtonComponent && <div className="table-dropdown-col" />}
          </div>
          <div className="table-body" style={{ flexDirection: "column" }}>
            {this.state.currentRows.map((row: TableRow, i: number) => (
              /* I am using index as key as element is an array of objects */
              <div className="table-rows" key={i}>
                <div className="table-checkbox-column">
                  <UniversalCheckbox
                    name={`table-${i}`}
                    liveValue={newValue => {
                      this.updateRowSelection(row, newValue);
                    }}
                    startingvalue={this.state.selectedRows.includes(row)}
                  />
                </div>
                <div className="table-body-cols">
                  {row.cells.map((cell, j) => (
                    <div
                      className="table-col"
                      style={{ width: this.getWidth() + "%" }}
                      key={this.props.headers[j].headline}>
                      {cell.component}
                    </div>
                  ))}
                </div>
                {this.props.actionButtonComponent && (
                  <div className="table-dropdown-col">
                    <DropDownWithIcon dropDownComponent={this.props.actionButtonComponent} />
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
