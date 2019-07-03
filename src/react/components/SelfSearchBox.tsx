import * as React from "react";

interface Props {
  placeholder?: string;
  possibleValues: { searchstring: string; link: string }[];
  moveTo: Function;
}

interface State {
  value: string;
  searching: boolean;
  context: Boolean;
  clientX: number;
  clientY: number;
}

class SelfSearchBox extends React.Component<Props, State> {
  state = {
    value: "",
    searching: false,
    context: false,
    clientX: 0,
    clientY: 0
  };

  wrapper = React.createRef();

  componentDidMount() {
    document.addEventListener("mousedown", e => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", e => this.handleClickOutside(e));
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  handleClickOutside(event) {
    if (this.wrapper && this.wrapper.current && !this.wrapper.current.contains(event.target)) {
      this.setState({ context: false });
    }
  }

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
    const possibleValues = this.props.possibleValues;

    let numresults = 0;
    let results: JSX.Element[] = [];
    if (this.state.value != "") {
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
              onClick={() => this.props.moveTo(possibleValues[i].link)}>
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
          <div style={{ width: "355px", height: "10px", position: "relative" }} />
          <div className="resultHolder">{results}</div>
        </React.Fragment>
      );
    }
  };

  render() {
    const { value } = this.state;
    const { clipboard } = require("electron");

    return (
      <div
        className="genericSearchHolder"
        onMouseLeave={() => this.toggleSearch(false)}
        onMouseEnter={() => (this.timeout ? this.cTimeout() : "")}
        ref={this.wrapper}>
        <div className="genericSearchBox">
          <div className="searchHolder">
            <div
              className="searchField"
              style={{ left: this.state.searching ? "0px" : "-315px" }}
              onContextMenu={e => {
                e.preventDefault();
                console.log("SELF");
                if (!this.state.searching) {
                  this.setState({ context: true, clientX: e.clientX, clientY: e.clientY });
                }
              }}>
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
        {this.state.context && (
          <button
            className="cleanup contextButton"
            onClick={() => {
              this.setState({ context: false, value: clipboard.readText() });
            }}
            style={{
              position: "fixed",
              top: this.state.clientY,
              left: this.state.clientX,
              right: "auto"
            }}>
            <i className="fal fa-paste" />
            <span style={{ marginLeft: "8px", fontSize: "12px" }}>Paste</span>
          </button>
        )}
      </div>
    );
  }
}
export default SelfSearchBox;
