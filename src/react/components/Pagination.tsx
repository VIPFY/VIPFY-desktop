import * as React from "react";

interface Props {
  rowsPerPage: number;
  totalRows: number;
  goToPage: Function;
  currentPage: number;
}

export default (props: Props) => {
  const calculateUpperBound = () => {
    if (props.currentPage * props.rowsPerPage > props.totalRows) {
      return props.totalRows;
    } else {
      return props.currentPage * props.rowsPerPage;
    }
  };

  const lowerBound = () => {
    if (props.totalRows == 0) {
      return 0;
    } else {
      return props.currentPage * props.rowsPerPage - props.rowsPerPage + 1;
    }
  };

  const isLastPage = props.currentPage * props.rowsPerPage <= props.totalRows;

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
      <span className="turnPage"> of </span> {props.totalRows}
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
