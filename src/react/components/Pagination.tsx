import * as React from "react";

interface Props {
  postsPerPage: number;
  totalPosts: number;
  paginate: Function;
  currentPage: number;
}

class Pagination extends React.Component<Props> {
  calculatePageNumber() {
    let pageNumbers = [];
    for (
      let index = 0;
      index < Math.ceil(this.props.totalPosts / this.props.postsPerPage);
      index++
    ) {
      pageNumbers.push(index);
    }
    return pageNumbers;
  }

  upperBound() {
    if (this.props.currentPage * this.props.postsPerPage > this.props.totalPosts) {
      return this.props.totalPosts;
    } else {
      return this.props.currentPage * this.props.postsPerPage;
    }
  }

  lowerBound() {
    if (this.props.totalPosts == 0) {
      return 0;
    } else {
      return this.props.currentPage * this.props.postsPerPage - this.props.postsPerPage + 1;
    }
  }

  exceedsUpperLimit() {
    return this.props.currentPage * this.props.postsPerPage <= this.props.totalPosts;
  }

  render() {
    return (
      <div className="pagination">
        {this.props.currentPage == 1 ? (
          <div className="prev-page">
            <i className="far fa-chevron-left"></i>
          </div>
        ) : (
          <div
            onClick={() => this.props.paginate(this.props.currentPage - 1)}
            className="next-page">
            <i className="fas fa-chevron-left"></i>
          </div>
        )}
        <span>
          {this.lowerBound()} - {this.upperBound()}
        </span>
        <span className="text"> of </span> {this.props.totalPosts}
        {this.exceedsUpperLimit() ? (
          <div
            onClick={() => this.props.paginate(this.props.currentPage + 1)}
            className="prev-page">
            <i className="fas fa-chevron-right"></i>
          </div>
        ) : (
          <div className="prev-page">
            <i className="far fa-chevron-right"></i>
          </div>
        )}
      </div>
    );
  }
}
export default Pagination;
