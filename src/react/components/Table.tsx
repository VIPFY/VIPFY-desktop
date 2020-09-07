import * as React from "react";
import UniversalCheckbox from "./universalForms/universalCheckbox";
import DropdownWithIcon from "./DropdownWithIcon";
import DropDown from "../common/DropDown";
import Pagination from "./Pagination";
import UniversalTextInput from "./universalForms/universalTextInput";

interface Props {
  title: string;
  tableHeaders: object;
  tableData: object;
  dropDown: JSX.Element;
  additionalHeader: boolean;
}

interface State {
  data: object;
  search: string;
  sort: string;
  sortForward: boolean;
  checkBoxStatusArray: object;
  globalCheckbox: boolean;
  currentPage: number;
  rowsPerPage: number;
  currentRows: object;
}

class Table extends React.Component<Props, State> {
  state = {
    data: this.props.tableData,
    search: "",
    sort: "",
    sortForward: false,
    checkBoxStatusArray: this.initializeArray(),
    globalCheckbox: false,
    rowCount: 2,
    currentPage: 1,
    rowsPerPage: 2,
    currentRows: []
  };

  getWidth() {
    if (this.props.tableHeaders.headers.length > 0) {
      return Math.round(100 / this.props.tableHeaders.headers.length);
    } else {
      return "100%";
    }
  }
  initializeArray() {
    let array = [];
    if (this.props.tableData.length > 0) {
      this.props.tableData.forEach((element, index) => {
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

  searchTerm(search: String) {
    const data = [];
    if (!search) {
      this.setState({ data: this.props.tableData });
    } else {
      this.props.tableData.map(element => {
        element.map(e => {
          if (`${e.index}`.toUpperCase().includes(search.toUpperCase())) {
            if (data.indexOf(element) === -1) {
              data.push(element);
            }
          }
        });
      });
      this.setState({ data: data });
    }
  }

  handleSortClick(sorted: any) {
    if (sorted != this.state.sort) {
      this.setState({ sortForward: true, sort: sorted });
    } else {
      this.setState(oldstate => {
        return { sortForward: !oldstate.sortForward };
      });
    }
    this.sortTable(sorted);
  }

  checkboxStatus(b) {
    let checkBoxStatusArray = [];
    let checkbox = false;
    this.state.data.forEach((_el, index) => {
      checkBoxStatusArray[index] = b ? true : false;
      checkbox = b ? true : false;
    });
    this.setState({ globalCheckbox: checkbox, checkBoxStatusArray: checkBoxStatusArray });
  }

  changeCheckboxState(e, index) {
    this.setState({ globalCheckbox: false });
    this.setState(
      oldstate =>
        (oldstate.checkBoxStatusArray[index] = e && !this.state.checkBoxStatusArray.includes(index))
    );
  }

  goToPage(pageNumber) {
    this.setState({ currentPage: pageNumber });
    let indexOfLastRow = this.state.currentPage * this.state.rowsPerPage;
    let indexOfFirstRow = indexOfLastRow - this.state.rowsPerPage;
    let currentRows = this.state.data.slice(indexOfFirstRow, indexOfLastRow);
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
                  totalPosts={this.state.data.length}
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
                name={"Show Borders"}
                liveValue={b => {
                  this.checkboxStatus(b);
                }}
                startingvalue={this.state.globalCheckbox}
              />
            </div>
            <div className="table-body-cols">
              {this.props.tableHeaders.headers.length > 0 &&
                this.props.tableHeaders.headers.map(header => (
                  <div
                    className="table-col"
                    style={{ width: this.getWidth() + "%" }}
                    onClick={() => {
                      this.handleSortClick(header.title);
                    }}
                    key={header.title}>
                    {header.title}
                    {header.sortable &&
                      (header.title === this.state.sort ? (
                        this.state.sortForward ? (
                          <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                        ) : (
                          <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                        )
                      ) : (
                        <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
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
                      this.changeCheckboxState(e, index);
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
                    <DropdownWithIcon dropDownComponent={this.props.dropDown} />
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
