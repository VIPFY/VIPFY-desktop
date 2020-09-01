import * as React from "react";
import UniversalCheckbox from "./universalForms/universalCheckbox";
import DropdownWithIcon from "./DropdownWithIcon";
import DropDown from "../common/DropDown";
import Pagination from "./Pagination";
import UniversalTextInput from "./universalForms/universalTextInput";

interface Props {
  title: string;
  tableHeaders: object;
  tableData: any;
  dropDown: any;
  additionalHeader: any;
}

interface State {
  data: any;
  search: string;
  sort: string;
  sortforward: boolean;
  var_arr: any;
  global_checkbox: boolean;
  currentPage: number;
  postPerPage: number;
  currentPost: any;
}

class Table extends React.Component<Props, State> {
  state = {
    data: this.props.tableData,
    search: "",
    sort: "",
    sortforward: false,
    var_arr: this.initializeArray(),
    global_checkbox: false,
    rowCount: 2,
    currentPage: 1,
    postPerPage: 2,
    currentPost: []
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
    let indexOfLastPost = this.state.currentPage * this.state.postPerPage;
    let indexOfFirstPost = indexOfLastPost - this.state.postPerPage;
    this.state.currentPost = this.state.data.slice(indexOfFirstPost, indexOfLastPost);
    return this.state.currentPost;
  }

  sortTable(sorted: any) {
    let sortforward = this.state.sortforward;
    let stringA = "";
    let stringB = "";

    this.state.data.sort(function (a, b) {
      a.forEach(element => {
        if (element.header == sorted) {
          stringA = `${element.index}`.toUpperCase();
        }
      });
      b.forEach(element => {
        if (element.header == sorted) {
          stringB = `${element.index}`.toUpperCase();
        }
      });

      if (stringA < stringB) {
        if (sortforward) {
          return -1;
        } else {
          return 1;
        }
      }

      if (stringA > stringB) {
        if (sortforward) {
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    });
  }

  searchInTable(search: String) {
    const data = [];
    if (search != "") {
      this.props.tableData.map(element => {
        element.map(e => {
          if (`${e.index}`.toUpperCase().includes(search.toUpperCase())) {
            if (data.indexOf(element) > -1) {
            } else {
              data.push(element);
            }
          }
        });
      });

      this.setState({ data: data });
    } else {
      this.setState({ data: this.props.tableData });
    }
  }

  handleSortClick(sorted: any) {
    if (sorted != this.state.sort) {
      this.setState({ sortforward: true, sort: sorted });
    } else {
      this.setState(oldstate => {
        return { sortforward: !oldstate.sortforward };
      });
    }
    this.sortTable(sorted);
  }

  checkboxStatus(b) {
    let arr = [];
    let checkbox;
    if (b) {
      this.state.data.map((element, index) => {
        arr[index] = true;
        checkbox = true;
      });
    } else {
      this.state.data.map((element, index) => {
        arr[index] = false;
        checkbox = false;
      });
    }
    this.setState({ global_checkbox: checkbox, var_arr: arr });
  }

  changeCheckboxState(e, index) {
    this.setState({ global_checkbox: false });
    if (e && !this.state.var_arr.includes(index)) {
      this.setState(oldstate => (oldstate.var_arr[index] = true));
    } else {
      this.setState(oldstate => (oldstate.var_arr[index] = false));
    }
  }

  //paginate = pageNumber => this.setState({ currentPage: pageNumber });
  paginate(pageNumber) {
    this.setState({ currentPage: pageNumber });
    let indexOfLastPost = this.state.currentPage * this.state.postPerPage;
    let indexOfFirstPost = indexOfLastPost - this.state.postPerPage;
    let currentPost = this.state.data.slice(indexOfFirstPost, indexOfLastPost);
    this.setState({ currentPost: currentPost });
  }

  indexOfLastPost = this.state.currentPage * this.state.postPerPage;
  indexOfFirstPost = this.indexOfLastPost - this.state.postPerPage;

  render() {
    return (
      <section className="table-section">
        {this.props.additionalHeader ? (
          <div className="extended-header">
            <div className="row extended-header-row">
              <div className="col-sm-6">
                <UniversalTextInput
                  id="tablesearchbox"
                  placeHolder="Search"
                  livevalue={v => this.searchInTable(v)}
                  icon="far fa-search"></UniversalTextInput>
              </div>
              <div className="col-sm-6 extended-header-right-col">
                <div className="row-count-text">Rows per page:</div>
                <DropDown
                  header={"Rows per page"}
                  option={this.state.postPerPage}
                  defaultValue={this.state.postPerPage}
                  handleChange={value => this.setState({ postPerPage: value, currentPage: 1 })}
                  options={[2, 4]}
                />
                <Pagination
                  postsPerPage={this.state.postPerPage}
                  totalPosts={this.state.data.length}
                  paginate={number => this.paginate(number)}
                  currentPage={this.state.currentPage}
                />
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="table">
          <div className="table-rows table-header">
            <div className="table-checkbox-column">
              <UniversalCheckbox
                name={"Show Borders"}
                liveValue={b => {
                  this.checkboxStatus(b);
                }}
                startingvalue={this.state.global_checkbox}
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
                    {header.sortable ? (
                      header.title == this.state.sort ? (
                        this.state.sortforward ? (
                          <i className="fad fa-sort-up" style={{ marginLeft: "8px" }}></i>
                        ) : (
                          <i className="fad fa-sort-down" style={{ marginLeft: "8px" }}></i>
                        )
                      ) : (
                        <i className="fas fa-sort" style={{ marginLeft: "8px", opacity: 0.4 }}></i>
                      )
                    ) : (
                      ""
                    )}
                  </div>
                ))}
            </div>
            {this.props.dropDown ? <div className="table-dropdown-col" /> : ""}
          </div>
          <div className="table-body" style={{ flexDirection: "column" }}>
            {this.getData().map((element, index) => (
              <div className="table-rows" key={index}>
                <div className="table-checkbox-column">
                  <UniversalCheckbox
                    name={`table-${index}`}
                    liveValue={e => {
                      this.changeCheckboxState(e, index);
                    }}
                    startingvalue={this.state.var_arr[index]}
                  />
                </div>
                <div className="table-body-cols">
                  {element.map(data => (
                    <div
                      className="table-col"
                      style={{ width: this.getWidth() + "%" }}
                      key={data.header}>
                      {data.index}
                    </div>
                  ))}
                </div>
                {this.props.dropDown ? (
                  <div className="table-dropdown-col">
                    <DropdownWithIcon dropDownComponent={this.props.dropDown}></DropdownWithIcon>
                  </div>
                ) : (
                  ""
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
