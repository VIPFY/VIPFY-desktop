import * as React from "react";

interface Props {
  placeholder?: string;
  searchFunction: Function;
}

interface State {
  value: string;
}

class SearchBox extends React.Component<Props, State> {
  state = {
    value: ""
  };

  handleChange = async e => {
    e.preventDefault();
    const value = e.target.value;
    this.setState({ value });

    await this.props.searchFunction(value);
  };

  render() {
    const { value } = this.state;

    return (
      <div className={`search-box ${value.length > 0 ? "search-active" : ""}`}>
        <div className="search-button">
          <i className="fas fa-search" />
        </div>
        <input
          type="text"
          value={value}
          onChange={this.handleChange}
          className="search-text"
          placeholder={this.props.placeholder ? this.props.placeholder : "Search..."}
        />
      </div>
    );
  }
}
export default SearchBox;
