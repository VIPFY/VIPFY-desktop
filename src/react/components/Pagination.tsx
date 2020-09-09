import * as React from "react";

interface Props {
  totalRows: number;
  maxRowsPerPage: number;
  currentPage: number;
  goToPage: Function;
}

export default (props: Props) => {
  const getIndexOfFirstRowOnCurrentPage = () => {
    if (!props.totalRows) {
      return 0;
    }

    return props.currentPage * props.maxRowsPerPage - props.maxRowsPerPage + 1;
  };

  const getIndexOfLastRowOnCurrentPage = () => {
    if (props.currentPage * props.maxRowsPerPage > props.totalRows) {
      return props.totalRows;
    } else {
      return props.currentPage * props.maxRowsPerPage;
    }
  };

  const isLastPage = props.currentPage * props.maxRowsPerPage <= props.totalRows;

  return (
    <div className="pagination">
      {props.currentPage === 1 ? (
        <div className="turnPage">
          <i className="far fa-chevron-left" />
        </div>
      ) : (
        <div onClick={() => props.goToPage(props.currentPage - 1)} className="turnPage">
          <i className="fas fa-chevron-left" />
        </div>
      )}
      <span>
        {getIndexOfFirstRowOnCurrentPage()} - {getIndexOfLastRowOnCurrentPage()}
      </span>
      <span className="turnPage"> of </span> {props.totalRows}
      {isLastPage ? (
        <div onClick={() => props.goToPage(props.currentPage + 1)} className="turnPage">
          <i className="fas fa-chevron-right" />
        </div>
      ) : (
        <div className="turnPage">
          <i className="far fa-chevron-right" />
        </div>
      )}
    </div>
  );
};
