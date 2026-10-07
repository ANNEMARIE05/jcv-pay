import { useMemo, useState } from 'react';

export function usePagedList<T>(items: T[], pageSize = 8, resetKey = '') {
  const [pageState, setPageState] = useState({ resetKey, page: 1 });
  const page = pageState.resetKey === resetKey ? pageState.page : 1;
  const setPage = (nextPage: number) => setPageState({ resetKey, page: nextPage });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    total,
    pageSize,
    from: total === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, total),
  };
}
