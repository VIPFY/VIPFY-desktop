import * as React from "react";

interface Props {
  placeholder?: string;
}

interface State {
  value: string;
  searching: boolean;
}

class SelfSearchBox extends React.Component<Props, State> {
  state = {
    value: "",
    searching: false
  };

  componentWillUnmount = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  handleChange = async e => {
    e.preventDefault();
    const value = e.target.value;
    this.setState({ value });

    //await this.props.searchFunction(value);
  };

  activeSearch = () => {
    console.log("Searching");
  };

  toggleSearch = (b, e = null) => {
    if (b) {
      this.setState({ searching: true });
      this.input.focus();
      if (e) {
        e!.preventDefault();
      }
    } else {
      this.timeout = setTimeout(() => this.closeSearch(), 300);
    }
  };

  closeSearch = () => {
    this.setState({ searching: false, value: "" });
    this.timeout = null;
  };

  cTimeout = () => {
    clearTimeout(this.timeout);
    this.timeout = null;
  };

  printResults = () => {
    const possibleValues = [
      "Jannis Froese",
      "Pascal Clanget",
      "Markus Müller",
      "Nils Vossebein",
      "Lisa Brödlin",
      "Anna Reindl",
      "Jesko Dujmovic",
      "Osama Haroon"
    ];

    let numresults = 0;
    let results: JSX.Element[] = [];
    if (this.state.value != "") {
      for (let i = 0; i < possibleValues.length; i++) {
        if (
          numresults < 5 &&
          possibleValues[i].toLowerCase().includes(this.state.value.toLowerCase())
        ) {
          let index = possibleValues[i].toLowerCase().indexOf(this.state.value.toLowerCase());
          results.push(
            <div key={`searchResult-${i}`} className="searchResult">
              <span>{possibleValues[i].substring(0, index)}</span>
              <span className="resultHighlight">
                {possibleValues[i].substring(index, index + this.state.value.length)}
              </span>
              <span>{possibleValues[i].substring(index + this.state.value.length)}</span>
            </div>
          );
          numresults++;
        }
      }
      return (
        <React.Fragment>
          <div style={{ width: "355px", height: "10px", position: "relative" }} />
          <div className="resultHolder">{results}</div>
        </React.Fragment>
      );
    }
  };

  render() {
    const { value } = this.state;

    return (
      <div
        className="genericSearchHolder"
        onMouseLeave={() => this.toggleSearch(false)}
        onMouseEnter={() => (this.timeout ? this.cTimeout() : "")}>
        <div className="genericSearchBox">
          <div className="searchHolder">
            <div className="searchField" style={{ left: this.state.searching ? "0px" : "-315px" }}>
              <input
                value={this.state.value}
                onChange={input => this.handleChange(input)}
                ref={i => {
                  this.input = i;
                }}
              />
            </div>
            <div
              className="searchButton"
              style={{ left: this.state.searching ? "315px" : "0px" }}
              onClick={e => this.toggleSearch(true, e)}
              onMouseEnter={() => this.toggleSearch(true)}>
              <i className="fal fa-search" />
            </div>
            <div
              className="searchPlaceholder"
              onMouseEnter={() => this.toggleSearch(true)}
              onClick={e => this.toggleSearch(true, e)}
              style={{ left: this.state.searching ? "350px" : "40px" }}>
              {this.props.placeholder ? this.props.placeholder : "Search..."}
            </div>
          </div>
        </div>
        {this.state.value != "" ? this.printResults() : ""}
      </div>
    );
  }
}
export default SelfSearchBox;
