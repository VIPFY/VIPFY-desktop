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
  allRows: TableRow[];
  pageRows: TableRow[];
  selectedRows: TableRow[];
  maxRowsPerPage: number;
  currentPage: number;
  searchTerm: string;
  sortBy: string;
  sortAscending: boolean;
}

const DEFAULT_MAX_ROWS_PER_PAGE = 20;

class Table extends React.Component<Props, State> {
  state = {
    allRows: this.props.data,
    pageRows: this.getCurrentRows(this.props.data, 1, DEFAULT_MAX_ROWS_PER_PAGE),
    selectedRows: [],
    currentPage: 1,
    maxRowsPerPage: DEFAULT_MAX_ROWS_PER_PAGE,
    searchTerm: "",
    sortBy: "",
    sortAscending: false
  };

  search(searchTerm: String) {
    if (!searchTerm) {
      this.setState({ allRows: this.props.data });
      return;
    }

    const allRows = [];

    this.props.data.map(row => {
      row.cells.map(cell => {
        if (
          `${cell.searchableText}`.toUpperCase().includes(searchTerm.toUpperCase()) &&
          !allRows.includes(row)
        ) {
          allRows.push(row);
        }
      });
    });

    this.setState({ allRows });
  }

  handleSortClick(sortBy: string) {
    const sortAscending = sortBy === this.state.sortBy ? !this.state.sortAscending : true;
    const columnIndex = this.props.headers.findIndex(header => header.headline === sortBy);

    const sortedData = this.state.allRows.sort(function (rowA: TableRow, rowB: TableRow) {
      const stringA = rowA.cells[columnIndex].searchableText;
      const stringB = rowB.cells[columnIndex].searchableText;
      const comparison = stringA.localeCompare(stringB, undefined, { sensitivity: "base" });

      return sortAscending ? comparison : -comparison;
    });

    this.setState({ allRows: sortedData, sortBy, sortAscending });
    this.goToPage(1);
  }

  checkOrUncheckAllRows(check: boolean) {
    this.setState(oldState => {
      return {
        selectedRows: check
          ? this.getCurrentRows(oldState.allRows, oldState.currentPage, oldState.maxRowsPerPage)
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

      return { selectedRows };
    });
  }

  goToPage(pageNumber: number) {
    const pageRows = this.getCurrentRows(
      this.state.allRows,
      this.state.currentPage,
      this.state.maxRowsPerPage
    );

    this.setState({ pageRows, currentPage: pageNumber });
  }

  getCurrentRows(allRows: TableRow[], currentPage: number, maxRowsPerPage: number) {
    const indexOfLastRow = currentPage * maxRowsPerPage;
    const indexOfFirstRow = indexOfLastRow - maxRowsPerPage;

    return allRows.slice(indexOfFirstRow, indexOfLastRow);
  }

  render() {
    const {
      allRows,
      currentPage,
      maxRowsPerPage,
      pageRows,
      selectedRows,
      sortAscending,
      sortBy
    } = this.state;

    const { actionButtonComponent, data, headers } = this.props;

    const allRowsSelected = selectedRows.length === pageRows.length;

    return (
      <section className="table-section">
        <div className="extended-header">
          <div className="row extended-header-row">
            <div className="colSm">
              <UniversalTextInput
                id="tablesearchbox"
                placeHolder="Search"
                livevalue={searchTerm => this.search(searchTerm)}
                icon="far fa-search"
              />
            </div>

            <div className="colSm extended-header-right-col">
              <p className="row-count-text">Rows per Page:</p>
              <DropDown
                header="maxRowsPerPage"
                option={maxRowsPerPage}
                defaultValue={20}
                handleChange={(value: number) =>
                  this.setState({
                    maxRowsPerPage: value,
                    currentPage: 1,
                    pageRows: data.slice(0, value)
                  })
                }
                options={[10, 20, 50]}
              />

              <Pagination
                maxRowsPerPage={maxRowsPerPage}
                totalRows={allRows.length}
                goToPage={pageNumber => this.goToPage(pageNumber)}
                currentPage={currentPage}
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
                startingvalue={allRowsSelected}
              />
            </div>

            <div className="table-body-cols">
              {headers &&
                headers.map(header => (
                  <div
                    className="table-col"
                    style={{ width: Math.round(100 / headers.length) + "%" }}
                    onClick={() => {
                      this.handleSortClick(header.headline);
                    }}
                    key={header.headline}>
                    {header.headline}
                    {header.sortable &&
                      (header.headline === sortBy ? (
                        sortAscending ? (
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
            {actionButtonComponent && <div className="table-dropdown-col" />}
          </div>

          <div className="table-body" style={{ flexDirection: "column" }}>
            {pageRows.map((row: TableRow, i: number) => (
              /* I am using index as key as element is an array of objects */
              <div className="table-rows" key={i}>
                <div className="table-checkbox-column">
                  <UniversalCheckbox
                    name={`table-${i}`}
                    liveValue={newValue => {
                      this.updateRowSelection(row, newValue);
                    }}
                    startingvalue={selectedRows.includes(row)}
                  />
                </div>

                <div className="table-body-cols">
                  {row.cells.map((cell, j) => (
                    <div
                      className="table-col"
                      style={{ width: Math.round(100 / headers.length) + "%" }}
                      key={headers[j].headline}>
                      {cell.component}
                    </div>
                  ))}
                </div>

                {actionButtonComponent && (
                  <div className="table-dropdown-col">
                    <DropDownWithIcon dropDownComponent={actionButtonComponent} />
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
