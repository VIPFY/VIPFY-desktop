import * as React from "react";
import DropDown from "../common/DropDown";
import Pagination from "./Pagination";
import DropDownWithIcon from "./DropDownWithIcon";
import UniversalCheckbox from "./universalForms/universalCheckbox";
import UniversalTextInput from "./universalForms/universalTextInput";

interface TableCell {
  component: React.Component;
  searchableText?: string;
}

interface TableRow {
  id: string;
  onClick?: Function;
  cells: TableCell[];
}

interface Props {
  title: string;
  headers: { headline: string; sortable?: boolean; fraction: number }[];
  data: TableRow[];
  actionButtonComponent: Function;
  actionTagButtonComponent: Function;
  searchPlaceHolder: string;
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
    pageRows: this.getPageRows(1, this.props.data, DEFAULT_MAX_ROWS_PER_PAGE),
    selectedRows: [],
    currentPage: 1,
    maxRowsPerPage: DEFAULT_MAX_ROWS_PER_PAGE,
    searchTerm: "",
    sortBy: "",
    sortAscending: false
  };

  search(searchTerm: string) {
    let matchingRows = [];

    if (!searchTerm) {
      matchingRows = this.props.data;
    } else {
      this.props.data.map(row => {
        row.cells.map(cell => {
          if (
            cell.searchableText?.toUpperCase().includes(searchTerm.toUpperCase()) &&
            !matchingRows.includes(row)
          ) {
            matchingRows.push(row);
          }
        });
      });
    }

    this.setState({ allRows: matchingRows }, () => this.goToPage(1));
  }

  sort(sortBy: string) {
    const sortAscending = sortBy === this.state.sortBy ? !this.state.sortAscending : true;
    const columnIndex = this.props.headers.findIndex(header => header.headline === sortBy);

    const sortedRows = this.state.allRows.sort(function (rowA: TableRow, rowB: TableRow) {
      const stringA = rowA.cells[columnIndex].searchableText;
      const stringB = rowB.cells[columnIndex].searchableText;
      const comparison =
        stringA && stringB && stringA.localeCompare(stringB, undefined, { sensitivity: "base" });

      return sortAscending ? comparison : -comparison;
    });

    this.setState({ allRows: sortedRows, sortBy, sortAscending }, () => this.goToPage(1));
  }

  checkOrUncheckAllRows(check: boolean, allRowsSelected: string) {
    this.state.selectedRows.length > 0
      ? allRowsSelected === "Active"
        ? this.setState({
            selectedRows: this.state.allRows
          })
        : this.setState({
            selectedRows: []
          })
      : this.setState(oldState => {
          return {
            selectedRows: check
              ? this.getPageRows(oldState.currentPage, oldState.allRows, oldState.maxRowsPerPage)
              : []
          };
        });
  }

  checkOrUncheckRow(row: TableRow, checked: boolean) {
    this.setState(oldState => {
      let selectedRows =
        oldState.selectedRows.length === oldState.allRows.length
          ? this.getPageRows(oldState.currentPage, oldState.allRows, oldState.maxRowsPerPage)
          : oldState.selectedRows;

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
    const pageRows = this.getPageRows(pageNumber, this.state.allRows, this.state.maxRowsPerPage);
    this.setState({ pageRows, currentPage: pageNumber, selectedRows: [] });
  }

  getPageRows(page: number, allRows: TableRow[], maxRowsPerPage: number) {
    const indexOfLastRow = page * maxRowsPerPage;
    const indexOfFirstRow = indexOfLastRow - maxRowsPerPage;

    return allRows.slice(indexOfFirstRow, indexOfLastRow);
  }

  getRowIds(selectedRows: any) {
    let ids = [];

    selectedRows.map(row => {
      ids.push(row.id);
    });

    return ids;
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

    const {
      actionButtonComponent,
      data,
      headers,
      searchPlaceHolder,
      actionTagButtonComponent
    } = this.props;

    const allRowsSelected =
      selectedRows.length == pageRows.length || selectedRows.length == allRows.length;
    return (
      <section className="table-section">
        <div className="extended-header">
          <div className="row extended-header-row">
            <div className="extended-header-col">
              <UniversalTextInput
                id="tablesearchbox"
                placeHolder={searchPlaceHolder || "Search"}
                livevalue={searchTerm => this.search(searchTerm)}
                icon="far fa-search"
                smallTextField={true}
                style={{ backgroundColor: "white" }}
              />
            </div>

            <div className="extended-header-col">
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
          <div className="table-header">
            <div className="table-rows">
              <div className="table-checkbox-column">
                <UniversalCheckbox
                  name={"checkOrUncheckAllRows"}
                  liveValue={check => this.checkOrUncheckAllRows(check, "")}
                  startingvalue={
                    selectedRows.length > 0
                      ? selectedRows.length == pageRows.length
                        ? true
                        : "Some"
                      : false
                  }
                  checkboxSmall={true}
                />
              </div>

              <div className="table-body-cols">
                {headers &&
                  selectedRows.length === 0 &&
                  headers.map(header => (
                    <span
                      className="table-col header"
                      style={header.fraction ? { flexGrow: header.fraction } : undefined}
                      onClick={() => {
                        this.sort(header.headline);
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
                    </span>
                  ))}
                {selectedRows.length > 0 && (
                  <div className="table-section-header-body">
                    <div className="table-col">
                      <span>{selectedRows.length}</span>
                      <span className={"table-header-text"}>
                        {selectedRows.length === 1 ? " Item" : " Items"} on this page are selected
                      </span>
                      {selectedRows.length !== data.length && (
                        <span
                          className={"table-header-text select-all-items"}
                          onClick={() => this.checkOrUncheckAllRows(true, allRowsSelected)}>
                          Select all {data.length} items
                        </span>
                      )}
                    </div>
                    {actionTagButtonComponent && (
                      <div className="table-col">
                        {actionTagButtonComponent(this.getRowIds(selectedRows))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {actionButtonComponent && selectedRows.length === 0 && (
                <div className="table-dropdown-col" />
              )}
            </div>
          </div>

          <div className="table-body" style={{ flexDirection: "column" }}>
            {pageRows.map((row: TableRow, i: number) => (
              /* I am using index as key as element is an array of objects */
              <div
                className="table-rows"
                key={i}
                ref={ref => (this.ref = ref)}
                onClick={event => {
                  if (row.onClick) {
                    event.preventDefault();
                    row.onClick();
                  }
                }}
                style={row.onClick ? { cursor: "pointer" } : {}}>
                <div className="table-checkbox-column" onClick={event => event.stopPropagation()}>
                  <UniversalCheckbox
                    name={`table-${i}`}
                    liveValue={newValue => {
                      this.checkOrUncheckRow(row, newValue);
                    }}
                    startingvalue={selectedRows.includes(row)}
                    checkboxSmall={true}
                  />
                </div>

                <div className="table-body-cols">
                  {row.cells.map((cell, j) => (
                    <div
                      key={`row-${i}-cell-${j}`}
                      className="table-col"
                      style={headers[j].fraction ? { flexGrow: headers[j].fraction } : undefined}>
                      {cell && cell.component && <cell.component />}
                    </div>
                  ))}
                </div>

                {actionButtonComponent && (
                  <div className="table-dropdown-col" onClick={event => event.stopPropagation()}>
                    <DropDownWithIcon dropDownComponent={actionButtonComponent(row.id)} />
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
