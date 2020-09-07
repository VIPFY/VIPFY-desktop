import * as React from "react";

interface Props {
  rowsPerPage: number;
  totalPosts: number;
  goToPage: Function;
  currentPage: number;
}

export default (props: Props) => {
  const calculateUpperBound = () => {
    if (props.currentPage * props.rowsPerPage > props.totalPosts) {
      return props.totalPosts;
    } else {
      return props.currentPage * props.rowsPerPage;
    }
  };

  const lowerBound = () => {
    if (props.totalPosts == 0) {
      return 0;
    } else {
      return props.currentPage * props.rowsPerPage - props.rowsPerPage + 1;
    }
  };

  const isLastPage = props.currentPage * props.rowsPerPage <= props.totalPosts;

  return (
    <div className="pagination">
      {props.currentPage == 1 ? (
        <div className="turnPage">
          <i className="far fa-chevron-left"></i>
        </div>
      ) : (
        <div onClick={() => props.goToPage(props.currentPage - 1)} className="turnPage">
          <i className="fas fa-chevron-left"></i>
        </div>
      )}
      <span>
        {lowerBound()} - {calculateUpperBound()}
      </span>
      <span className="turnPage"> of </span> {props.totalPosts}
      {isLastPage ? (
        <div onClick={() => props.goToPage(props.currentPage + 1)} className="turnPage">
          <i className="fas fa-chevron-right"></i>
        </div>
      ) : (
        <div className="turnPage">
          <i className="far fa-chevron-right"></i>
        </div>
      )}
    </div>
  );
};
