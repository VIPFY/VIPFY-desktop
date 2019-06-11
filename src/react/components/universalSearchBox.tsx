import * as React from "react";

interface Props {
  placeholder?: string;
  selfitems?: { searchstring: string; id?: number }[]; // TODO
  getValue?: Function;
  automaticclosing?: Boolean;
  noautomaticclosing?: Boolean;
  boxStyles?: Object;
  resultStyles?: Object;
  startedsearch?: Boolean;
}

interface State {
  value: string;
  searching: Boolean;
  endsearch: Boolean;
}

class UniversalSearchBox extends React.Component<Props, State> {
  state = {
    value: "",
    searching: this.props.startedsearch || false,
    endsearch: false
  };

  componentWillUnmount = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  };

  handleChange = async e => {
    e.preventDefault();
    const value = e.target.value;
    this.setState({ value, endsearch: false });
    if (this.props.getValue) {
      if (this.props.selfitems && !this.state.endsearch) {
        this.props.getValue(null);
      } else {
        this.props.getValue(value);
      }
    }

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
      if (
        !this.props.noautomaticclosing &&
        (this.props.automaticclosing || this.state.value == "")
      ) {
        this.timeout = setTimeout(() => this.closeSearch(), 300);
      }
    }
  };

  closeSearch = () => {
    if (this.props.getValue) {
      this.props.getValue(this.state.value);
    }
    this.setState({ searching: false, value: "" });
    this.timeout = null;
  };

  cTimeout = () => {
    clearTimeout(this.timeout);
    this.timeout = null;
  };

  printResults = () => {
    if (this.props.selfitems) {
      const possibleValues = this.props.selfitems!;

      let numresults = 0;
      let results: JSX.Element[] = [];
      if (!this.state.endsearch) {
        for (let i = 0; i < possibleValues.length; i++) {
          if (
            numresults < 5 &&
            possibleValues[i].searchstring.toLowerCase().includes(this.state.value.toLowerCase())
          ) {
            let index = possibleValues[i].searchstring
              .toLowerCase()
              .indexOf(this.state.value.toLowerCase());
            results.push(
              <div
                key={`searchResult-${i}`}
                className="searchResult"
                onClick={() => {
                  if (this.props.getValue) {
                    this.props.getValue(possibleValues[i].id);
                  }
                  this.setState({ value: possibleValues[i].searchstring, endsearch: true });
                }}>
                <span>{possibleValues[i].searchstring.substring(0, index)}</span>
                <span className="resultHighlight">
                  {possibleValues[i].searchstring.substring(index, index + this.state.value.length)}
                </span>
                <span>
                  {possibleValues[i].searchstring.substring(index + this.state.value.length)}
                </span>
              </div>
            );
            numresults++;
          }
        }
        return (
          <React.Fragment>
            <div
              style={
                this.props.resultStyles
                  ? {}
                  : { width: "355px", height: "10px", position: "relative" }
              }
            />
            <div className="resultHolder" style={this.props.resultStyles}>
              {results}
            </div>
          </React.Fragment>
        );
      }
    }
  };

  render() {
    const { value } = this.state;

    return (
      <div
        className="genericSearchHolder"
        style={this.props.boxStyles}
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
        {this.printResults()}
      </div>
    );
  }
}
export default UniversalSearchBox;
