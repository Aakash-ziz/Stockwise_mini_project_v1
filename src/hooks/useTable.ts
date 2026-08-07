import { useState, useMemo, useEffect } from 'react';

interface UseTableProps<T> {
  data: T[];
  initialSortKey?: keyof T | null;
  initialSortOrder?: 'asc' | 'desc';
  initialPageSize?: number;
  searchFields?: (keyof T)[];
}

export function useTable<T>({
  data,
  initialSortKey = null,
  initialSortOrder = 'asc',
  initialPageSize = 10,
  searchFields = [],
}: UseTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset page when the data array changes (e.g. filter changes, item added/removed)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // 1. Search filter
  const searchedData = useMemo(() => {
    if (!searchQuery.trim() || searchFields.length === 0) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const val = item[field];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    const list = [...searchedData];
    if (!sortKey) return list;

    list.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      // General fallback
      return sortOrder === 'asc'
        ? (valA < valB ? -1 : valA > valB ? 1 : 0)
        : (valA > valB ? -1 : valA < valB ? 1 : 0);
    });

    return list;
  }, [searchedData, sortKey, sortOrder]);

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  
  // Ensure current page is in bounds
  const adjustedPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (adjustedPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, adjustedPage, pageSize]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (key: keyof T) => {
    if (sortKey !== key) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return {
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    currentPage: adjustedPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    searchedData,
    sortedData,
    paginatedData,
    handleSort,
    renderSortIndicator,
  };
}
