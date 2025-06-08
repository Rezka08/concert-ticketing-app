// import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasNext, 
  hasPrev 
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-ghost'}`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="btn btn-sm btn-ghost"
      >
        <HiChevronLeft className="w-4 h-4" />
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="btn btn-sm btn-ghost"
      >
        <HiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;